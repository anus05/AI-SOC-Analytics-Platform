import json
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from backend.database.models import AlertDB, AttackChainDB
from backend.services.neo4j_service import Neo4jGraphService


class AttackChainService:
    def __init__(self):
        self.neo4j_service = Neo4jGraphService()

    def reconstruct_attack_chains(self, db: Session) -> List[Dict[str, Any]]:
        """
        Reconstructs attack chains by dynamically grouping PostgreSQL alerts by source IP,
        user account, target destination, and timestamp chronology.
        """
        alerts = db.query(AlertDB).order_by(AlertDB.created_at.asc()).all()

        if not alerts:
            return []

        # Group alerts by source_ip to form distinct attack chains
        chains_by_ip = {}
        for alert in alerts:
            ip = alert.source_ip
            if ip not in chains_by_ip:
                chains_by_ip[ip] = []
            chains_by_ip[ip].append(alert)

        reconstructed_result = []

        for root_ip, ip_alerts in chains_by_ip.items():
            nodes = []
            edges = []
            prev_node_id = None
            max_threat = 0

            user_account = ip_alerts[0].user_account if ip_alerts else "Unknown"

            for idx, a in enumerate(ip_alerts):
                node_id = f"alert-node-{a.id}"
                max_threat = max(max_threat, a.threat_score or 50)

                nodes.append({
                    "id": node_id,
                    "stage": a.attack,
                    "mitre_id": a.technique or "T1110",
                    "severity": a.severity or "MEDIUM",
                    "timestamp": a.created_at.isoformat() if a.created_at else "2026-09-02T00:00:00Z",
                    "ip": a.source_ip,
                    "hostname": a.destination or "auth.internal.corp",
                    "username": a.user_account or "Unknown",
                    "type": "AttackStage"
                })

                if prev_node_id:
                    edges.append({
                        "from": prev_node_id,
                        "to": node_id,
                        "label": f"{ip_alerts[idx-1].attack} -> {a.attack}"
                    })

                prev_node_id = node_id

            chain_data = {
                "id": len(reconstructed_result) + 1,
                "title": f"Attack Chain: {ip_alerts[0].attack} Campaign from {root_ip}",
                "root_ip": root_ip,
                "user_account": user_account,
                "threat_score": max_threat,
                "status": "Active",
                "nodes": nodes,
                "edges": edges,
                "created_at": ip_alerts[0].created_at.isoformat() if ip_alerts[0].created_at else "2026-09-02T00:00:00Z"
            }

            reconstructed_result.append(chain_data)

            # Sync to Neo4j if available
            self.neo4j_service.store_attack_chain(nodes, edges)

        return reconstructed_result

    def get_attack_chain(self, db: Session, chain_id: int) -> Dict[str, Any]:
        chains = self.reconstruct_attack_chains(db)
        for c in chains:
            if c["id"] == chain_id or any(n.get("id") == f"alert-node-{chain_id}" for n in c.get("nodes", [])):
                return c
        return {}

