import os
from typing import Dict, Any, List


class Neo4jGraphService:
    """
    Neo4j Graph Database Service for managing attack graph entities & relationships.
    Uses neo4j official driver if installed/available, otherwise falls back gracefully.
    """
    def __init__(self):
        self.uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        self.user = os.getenv("NEO4J_USER", "neo4j")
        self.password = os.getenv("NEO4J_PASSWORD", "password")
        self.driver = None
        self._connect()

    def _connect(self):
        try:
            from neo4j import GraphDatabase
            self.driver = GraphDatabase.driver(self.uri, auth=(self.user, self.password))
            print("[+] Connected to Neo4j Attack Graph database.")
        except Exception as e:
            # Neo4j offline or package not installed - normal fallback
            self.driver = None

    def store_attack_chain(self, nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]) -> bool:
        if not self.driver:
            return False
        try:
            with self.driver.session() as session:
                for node in nodes:
                    query = (
                        "MERGE (n:AttackNode {id: $id}) "
                        "SET n.stage = $stage, n.ip = $ip, n.username = $username, n.severity = $severity"
                    )
                    session.run(query, id=node["id"], stage=node.get("stage"), ip=node.get("ip"), username=node.get("username"), severity=node.get("severity"))

                for edge in edges:
                    query = (
                        "MATCH (a:AttackNode {id: $from_id}), (b:AttackNode {id: $to_id}) "
                        "MERGE (a)-[r:LEADS_TO {label: $label}]->(b)"
                    )
                    session.run(query, from_id=edge["from"], to_id=edge["to"], label=edge.get("label", "CAUSED"))
            return True
        except Exception as e:
            print(f"[Neo4j Error] {e}")
            return False
