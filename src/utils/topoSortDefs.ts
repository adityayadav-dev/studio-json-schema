import type { AST } from "@hyperjump/json-schema/experimental";

type DefDependencyGraph = Map<string, Set<string>>; // defUri → set of defUris it depends on

/**
 * Phase 1: Extract the dependency graph from $defs
 */
function buildDefDependencyGraph(ast: AST): DefDependencyGraph {
    const graph: DefDependencyGraph = new Map();
    const DEFS_KEYS = [
        "https://json-schema.org/keyword/$defs",
        "https://json-schema.org/keyword/definitions"
    ];

    // Collect all $defs URIs
    for (const [, node] of Object.entries(ast)) {
        if (!Array.isArray(node)) continue;

        for (const [keywordName, , keywordValue] of node) {
            if (DEFS_KEYS.includes(keywordName)) {
                const defUris = keywordValue as string[];
                for (const defUri of defUris) {
                    if (!graph.has(defUri)) {
                        graph.set(defUri, new Set());
                    }
                }
            }
        }
    }

    // For each $def, find its $ref dependencies (only those pointing to other $defs)
    for (const defUri of graph.keys()) {
        const visited = new Set<string>();
        collectRefDependencies(defUri, defUri, graph, ast, visited);
    }

    return graph;
}

/**
 * Recursively collect $ref dependencies within a definition
 */
function collectRefDependencies(
    sourceDefUri: string,
    currentUri: string,
    graph: DefDependencyGraph,
    ast: AST,
    visited: Set<string>
): void {
    if (visited.has(currentUri)) return;
    visited.add(currentUri);

    const node = ast[currentUri];
    if (!Array.isArray(node)) return;

    const REF_KEY = "https://json-schema.org/keyword/ref";

    for (const [keywordName, , keywordValue] of node) {
        if (keywordName === REF_KEY) {
            const targetUri = keywordValue as string;
            if (graph.has(targetUri) && targetUri !== sourceDefUri) {
                graph.get(sourceDefUri)!.add(targetUri);
            }
        } else {
            // Recurse into any URIs found in the keywordValue that are part of this AST
            const findAndRecurse = (val: any) => {
                if (typeof val === "string") {
                    if (ast[val] && (!graph.has(val) || val === sourceDefUri)) {
                        collectRefDependencies(sourceDefUri, val, graph, ast, visited);
                    } else if (graph.has(val) && val !== sourceDefUri) {
                        // Also count direct references that aren't $ref keywords (e.g. in properties)
                        graph.get(sourceDefUri)!.add(val);
                    }
                } else if (Array.isArray(val)) {
                    val.forEach(findAndRecurse);
                } else if (typeof val === "object" && val !== null) {
                    Object.values(val).forEach(findAndRecurse);
                }
            };
            findAndRecurse(keywordValue);
        }
    }
}

/**
 * Phase 2: Topological sort using Kahn's algorithm
 * Returns sorted defUris or throws on cycle detection
 */
function topologicalSort(graph: DefDependencyGraph): string[] {
    // Compute in-degrees
    const inDegree = new Map<string, number>();
    for (const uri of graph.keys()) {
        inDegree.set(uri, 0);
    }
    for (const [, deps] of graph) {
        for (const dep of deps) {
            inDegree.set(dep, (inDegree.get(dep) ?? 0) + 1);
        }
    }

    // Enqueue nodes with in-degree 0
    const queue: string[] = [];
    for (const [uri, degree] of inDegree) {
        if (degree === 0) queue.push(uri);
    }

    const sorted: string[] = [];

    while (queue.length > 0) {
        const current = queue.shift()!;
        sorted.push(current);

        for (const dep of graph.get(current) ?? []) {
            const newDegree = inDegree.get(dep)! - 1;
            inDegree.set(dep, newDegree);
            if (newDegree === 0) queue.push(dep);
        }
    }

    if (sorted.length !== graph.size) {
        // Cycle detected — find and report the cycle
        const cycleNodes = [...graph.keys()].filter(
            uri => !sorted.includes(uri)
        );
        console.warn("⚠️ Cyclic $defs dependencies detected:", cycleNodes);
        // Append remaining nodes in original order (graceful degradation)
        sorted.push(...cycleNodes);
    }

    return sorted;
}

/**
 * Phase 3: Reorder $defs entries in the AST based on topological order
 */
export function topoSortDefs(ast: AST): AST {
    const graph = buildDefDependencyGraph(ast);

    if (graph.size === 0) return ast; // No $defs, nothing to sort

    const sortedDefUris = topologicalSort(graph);

    // Rebuild AST with $defs entries reordered
    // The $defs keyword handler iterates the value array in order,
    // so we reorder that array
    const DEFS_KEYS = [
        "https://json-schema.org/keyword/$defs",
        "https://json-schema.org/keyword/definitions"
    ];
    const newAst = { ...ast };

    for (const [uri, node] of Object.entries(newAst)) {
        if (!Array.isArray(node)) continue;

        newAst[uri] = node.map(entry => {
            const [keywordName, keywordPath, keywordValue] = entry;
            if (DEFS_KEYS.includes(keywordName)) {
                const defUris = keywordValue as string[];
                const reordered = sortedDefUris.filter(u => defUris.includes(u));
                // Preserve any defs not in the dep graph
                const remaining = defUris.filter(u => !sortedDefUris.includes(u));
                return [keywordName, keywordPath, [...reordered, ...remaining]];
            }
            return entry;
        });
    }

    return newAst;
}
