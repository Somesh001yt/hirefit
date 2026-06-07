from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.application import Application
from app.models.user import User
from app.schemas.schemas import ApplicationCreate, ApplicationUpdate, ApplicationResponse
from app.core.security import get_current_user

router = APIRouter(prefix="/applications", tags=["applications"])

@router.get("", response_model=list[ApplicationResponse])
async def list_applications(
    status: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        select(Application)
        .where(Application.user_id == current_user.id)
        .where(Application.deleted_at.is_(None))
        .order_by(Application.created_at.desc())
    )
    if status:
        query = query.where(Application.status == status)

    result = await db.execute(query)
    return result.scalars().all()

@router.post("", response_model=ApplicationResponse, status_code=201)
async def create_application(
    body: ApplicationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    app = Application(**body.model_dump(), user_id=current_user.id)
    db.add(app)
    await db.flush()
    return app

@router.get("/{app_id}", response_model=ApplicationResponse)
async def get_application(
    app_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Application)
        .where(Application.id == app_id)
        .where(Application.user_id == current_user.id)
        .where(Application.deleted_at.is_(None))
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app

@router.patch("/{app_id}", response_model=ApplicationResponse)
async def update_application(
    app_id: str,
    body: ApplicationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Application)
        .where(Application.id == app_id)
        .where(Application.user_id == current_user.id)
        .where(Application.deleted_at.is_(None))
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(app, field, value)

    return app

@router.delete("/{app_id}", status_code=204)
async def delete_application(
    app_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Application)
        .where(Application.id == app_id)
        .where(Application.user_id == current_user.id)
        .where(Application.deleted_at.is_(None))
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    app.deleted_at = datetime.now(timezone.utc)
