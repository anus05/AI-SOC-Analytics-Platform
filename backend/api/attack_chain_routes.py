from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.db import get_db
from backend.auth.auth import get_current_user
from backend.services.attack_chain import AttackChainService

router = APIRouter(prefix="/api/attack-chain", tags=["Attack Chain Reconstruction"])
attack_chain_service = AttackChainService()


@router.get("")
def list_attack_chains(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return attack_chain_service.reconstruct_attack_chains(db)


@router.get("/{chain_id}")
def get_attack_chain(
    chain_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    chain = attack_chain_service.get_attack_chain(db, chain_id)
    if not chain:
        raise HTTPException(status_code=404, detail=f"Attack chain #{chain_id} not found.")
    return chain
