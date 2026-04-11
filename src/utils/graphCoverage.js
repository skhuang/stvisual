function buildAdjacency(graph) {
  const adjacency = new Map();

  graph.nodes.forEach((node) => {
    adjacency.set(node.id, []);
  });

  graph.edges.forEach((edge) => {
    adjacency.get(edge.from).push(edge);
  });

  return adjacency;
}

function buildReverseAdjacency(graph) {
  const reverseAdjacency = new Map();

  graph.nodes.forEach((node) => {
    reverseAdjacency.set(node.id, []);
  });

  graph.edges.forEach((edge) => {
    reverseAdjacency.get(edge.to).push(edge);
  });

  return reverseAdjacency;
}

function isCycle(path) {
  return path.length > 2 && path[0] === path[path.length - 1];
}

function canonicalCycleKey(path) {
  const cycleBody = path.slice(0, -1);
  const rotations = cycleBody.map((_, index) => {
    const rotated = [...cycleBody.slice(index), ...cycleBody.slice(0, index)];
    return [...rotated, rotated[0]].join('->');
  });

  return rotations.sort()[0];
}

function edgeIdsFromPath(graph, path) {
  const edgeIds = [];

  for (let index = 0; index < path.length - 1; index += 1) {
    const from = path[index];
    const to = path[index + 1];
    const edge = graph.edges.find((item) => item.from === from && item.to === to);

    if (edge) {
      edgeIds.push(edge.id);
    }
  }

  return edgeIds;
}

export function enumerateSimplePaths(graph) {
  const adjacency = buildAdjacency(graph);
  const uniquePaths = new Map();

  function addPath(path) {
    if (path.length < 2) {
      return;
    }

    const key = isCycle(path) ? canonicalCycleKey(path) : path.join('->');

    if (!uniquePaths.has(key)) {
      uniquePaths.set(key, path);
    }
  }

  function dfs(startNodeId, path, visited) {
    const currentNodeId = path[path.length - 1];
    const outgoingEdges = adjacency.get(currentNodeId) || [];

    outgoingEdges.forEach((edge) => {
      const nextNodeId = edge.to;

      if (nextNodeId === startNodeId && path.length > 1) {
        addPath([...path, nextNodeId]);
        return;
      }

      if (!visited.has(nextNodeId)) {
        const nextPath = [...path, nextNodeId];
        addPath(nextPath);
        visited.add(nextNodeId);
        dfs(startNodeId, nextPath, visited);
        visited.delete(nextNodeId);
      }
    });
  }

  graph.nodes.forEach((node) => {
    dfs(node.id, [node.id], new Set([node.id]));
  });

  return Array.from(uniquePaths.values());
}

function canExtendForward(path, graph, adjacency) {
  if (isCycle(path)) {
    return false;
  }

  const currentNodeId = path[path.length - 1];
  const outgoingEdges = adjacency.get(currentNodeId) || [];

  return outgoingEdges.some((edge) => {
    const nextNodeId = edge.to;
    return nextNodeId === path[0] || !path.includes(nextNodeId);
  });
}

function canExtendBackward(path, reverseAdjacency) {
  if (isCycle(path)) {
    return false;
  }

  const firstNodeId = path[0];
  const incomingEdges = reverseAdjacency.get(firstNodeId) || [];

  return incomingEdges.some((edge) => {
    const previousNodeId = edge.from;
    return previousNodeId === path[path.length - 1] || !path.includes(previousNodeId);
  });
}

export function getPrimePaths(graph) {
  const adjacency = buildAdjacency(graph);
  const reverseAdjacency = buildReverseAdjacency(graph);

  return enumerateSimplePaths(graph).filter((path) => {
    if (isCycle(path)) {
      return true;
    }

    return !canExtendForward(path, graph, adjacency) && !canExtendBackward(path, reverseAdjacency);
  });
}

export function getNodeRequirements(graph) {
  return graph.nodes.map((node) => ({
    id: `node-${node.id}`,
    type: 'node',
    label: `Node ${node.label}`,
    displayText: node.label,
    nodes: [node.id],
    edges: [],
  }));
}

export function getEdgeRequirements(graph) {
  return graph.edges.map((edge) => ({
    id: `edge-${edge.id}`,
    type: 'edge',
    label: `Edge ${edge.from} -> ${edge.to}`,
    displayText: `${edge.from} -> ${edge.to}`,
    nodes: [edge.from, edge.to],
    edges: [edge.id],
  }));
}

export function getPrimePathRequirements(graph) {
  return getPrimePaths(graph).map((path, index) => ({
    id: `prime-path-${index + 1}`,
    type: 'prime-path',
    label: `Path ${path.join(' -> ')}`,
    displayText: path.join(' -> '),
    nodes: [...new Set(path)],
    edges: edgeIdsFromPath(graph, path),
    path,
  }));
}

export function getCoverageRequirements(graph, criterion) {
  if (criterion === 'node') {
    return getNodeRequirements(graph);
  }

  if (criterion === 'edge') {
    return getEdgeRequirements(graph);
  }

  if (criterion === 'prime-path') {
    return getPrimePathRequirements(graph);
  }

  return [];
}
