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

function normalizeGraph(graph) {
  const nodes = Array.isArray(graph?.nodes) ? graph.nodes : [];
  const edges = Array.isArray(graph?.edges) ? graph.edges : [];

  return {
    ...graph,
    nodes,
    edges,
  };
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

function containsNodePath(path, targetNodes) {
  if (!targetNodes.length || targetNodes.length > path.length) {
    return false;
  }

  for (let index = 0; index <= path.length - targetNodes.length; index += 1) {
    const matched = targetNodes.every((nodeId, offset) => path[index + offset] === nodeId);
    if (matched) {
      return true;
    }
  }

  return false;
}

function containsEdgePath(pathEdges, targetEdges) {
  if (!targetEdges.length || targetEdges.length > pathEdges.length) {
    return false;
  }

  for (let index = 0; index <= pathEdges.length - targetEdges.length; index += 1) {
    const matched = targetEdges.every((edgeId, offset) => pathEdges[index + offset] === edgeId);
    if (matched) {
      return true;
    }
  }

  return false;
}

export function enumerateSimplePaths(graph) {
  const normalizedGraph = normalizeGraph(graph);
  const adjacency = buildAdjacency(normalizedGraph);
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

  normalizedGraph.nodes.forEach((node) => {
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
  const normalizedGraph = normalizeGraph(graph);
  const adjacency = buildAdjacency(normalizedGraph);
  const reverseAdjacency = buildReverseAdjacency(normalizedGraph);

  return enumerateSimplePaths(normalizedGraph).filter((path) => {
    if (isCycle(path)) {
      return true;
    }

    return !canExtendForward(path, graph, adjacency) && !canExtendBackward(path, reverseAdjacency);
  });
}

export function getNodeRequirements(graph) {
  const normalizedGraph = normalizeGraph(graph);

  return normalizedGraph.nodes.map((node) => ({
    id: `node-${node.id}`,
    type: 'node',
    label: `Node ${node.label}`,
    displayText: node.label,
    nodes: [node.id],
    edges: [],
  }));
}

export function getEdgeRequirements(graph) {
  const normalizedGraph = normalizeGraph(graph);

  return normalizedGraph.edges.map((edge) => ({
    id: `edge-${edge.id}`,
    type: 'edge',
    label: `Edge ${edge.from} -> ${edge.to}`,
    displayText: `${edge.from} -> ${edge.to}`,
    nodes: [edge.from, edge.to],
    edges: [edge.id],
  }));
}

export function getPrimePathRequirements(graph) {
  const normalizedGraph = normalizeGraph(graph);

  return getPrimePaths(normalizedGraph).map((path, index) => ({
    id: `prime-path-${index + 1}`,
    type: 'prime-path',
    label: `Path ${path.join(' -> ')}`,
    displayText: path.join(' -> '),
    nodes: [...new Set(path)],
    edges: edgeIdsFromPath(normalizedGraph, path),
    path,
  }));
}

export function getEdgePairRequirements(graph) {
  const normalizedGraph = normalizeGraph(graph);
  const adjacency = buildAdjacency(normalizedGraph);
  const pairMap = new Map();

  normalizedGraph.edges.forEach((firstEdge) => {
    const nextEdges = adjacency.get(firstEdge.to) || [];

    nextEdges.forEach((secondEdge) => {
      const id = `edge-pair-${firstEdge.id}__${secondEdge.id}`;
      if (!pairMap.has(id)) {
        pairMap.set(id, {
          id,
          type: 'edge-pair',
          label: `Edge Pair ${firstEdge.from} -> ${firstEdge.to} -> ${secondEdge.to}`,
          displayText: `${firstEdge.from} -> ${firstEdge.to} -> ${secondEdge.to}`,
          nodes: [firstEdge.from, firstEdge.to, secondEdge.to],
          edges: [firstEdge.id, secondEdge.id],
        });
      }
    });
  });

  return Array.from(pairMap.values());
}

export function getCompletePathRequirements(graph) {
  const normalizedGraph = normalizeGraph(graph);
  const testPaths = generateTestPaths(normalizedGraph, { maxDepthMultiplier: 2 });

  return testPaths.map((path, index) => ({
    id: `complete-path-${index + 1}`,
    type: 'complete-path',
    label: `Complete Path ${path.join(' -> ')}`,
    displayText: path.join(' -> '),
    nodes: path,
    edges: edgeIdsFromPath(normalizedGraph, path),
    path,
  }));
}

export function generateTestPaths(graph, options = {}) {
  const normalizedGraph = normalizeGraph(graph);
  const adjacency = buildAdjacency(normalizedGraph);
  const nodeVisitLimit = options.nodeVisitLimit ?? 2;
  const maxDepthMultiplier = options.maxDepthMultiplier ?? 2;
  const maxDepth = Math.max(2, normalizedGraph.nodes.length * maxDepthMultiplier);
  const uniquePaths = new Map();

  if (!normalizedGraph.startNodeId || !normalizedGraph.endNodeId) {
    return [];
  }

  function dfs(currentNodeId, path, visitCount) {
    if (path.length > maxDepth) {
      return;
    }

    if (currentNodeId === normalizedGraph.endNodeId) {
      const key = path.join('->');
      if (!uniquePaths.has(key)) {
        uniquePaths.set(key, [...path]);
      }
      return;
    }

    const outgoingEdges = adjacency.get(currentNodeId) || [];
    outgoingEdges.forEach((edge) => {
      const nextNodeId = edge.to;
      const visited = visitCount.get(nextNodeId) || 0;
      if (visited >= nodeVisitLimit) {
        return;
      }

      visitCount.set(nextNodeId, visited + 1);
      path.push(nextNodeId);
      dfs(nextNodeId, path, visitCount);
      path.pop();
      visitCount.set(nextNodeId, visited);
    });
  }

  const visitCount = new Map([[normalizedGraph.startNodeId, 1]]);
  dfs(normalizedGraph.startNodeId, [normalizedGraph.startNodeId], visitCount);

  return Array.from(uniquePaths.values());
}

export function buildTestPathSetForRequirements(graph, requirements, options = {}) {
  const normalizedGraph = normalizeGraph(graph);
  const candidatePaths = generateTestPaths(normalizedGraph, options);

  const pathRecords = candidatePaths.map((path) => ({
    path,
    edgeIds: edgeIdsFromPath(normalizedGraph, path),
  }));

  const requirementPaths = requirements.map((requirement) => {
    const matchedRecord = pathRecords.find((record) => {
      if (requirement.type === 'node') {
        return record.path.includes(requirement.nodes[0]);
      }

      if (requirement.type === 'edge') {
        return record.edgeIds.includes(requirement.edges[0]);
      }

      if (requirement.type === 'edge-pair') {
        return containsEdgePath(record.edgeIds, requirement.edges);
      }

      if (requirement.type === 'prime-path' || requirement.type === 'complete-path') {
        return containsNodePath(record.path, requirement.nodes);
      }

      return false;
    });

    return {
      requirement,
      path: matchedRecord ? matchedRecord.path : null,
      covered: Boolean(matchedRecord),
    };
  });

  const uniquePathSet = new Set(
    requirementPaths
      .filter((entry) => entry.covered)
      .map((entry) => entry.path.join('->'))
  );

  return {
    candidatePaths,
    requirementPaths,
    selectedPaths: Array.from(uniquePathSet).map((item) => item.split('->')),
    uncoveredRequirements: requirementPaths.filter((entry) => !entry.covered).map((entry) => entry.requirement),
  };
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

  if (criterion === 'edge-pair') {
    return getEdgePairRequirements(graph);
  }

  if (criterion === 'complete-path') {
    return getCompletePathRequirements(graph);
  }

  return [];
}
