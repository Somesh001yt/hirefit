from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.application import AiAnalysis
from app.models.user import User
from app.schemas.schemas import (
    MatchRequest, MatchResponse,
    RewriteRequest, RewriteResponse,
    RewriteFullRequest, RewriteFullResponse,
    AiAnalysisResponse,
)
from app.core.security import get_current_user
from app.services.gemini import analyze_match, rewrite_summary, rewrite_full_resume

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/match", response_model=MatchResponse, status_code=201)
async def match_resume(
    body: MatchRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = await analyze_match(body.resume_text, body.jd_text)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")

    analysis = AiAnalysis(
        user_id=current_user.id,
        application_id=body.application_id,
        resume_text=body.resume_text,
        jd_text=body.jd_text,
        score=result.get("score"),
        matched_keywords=result.get("matched_keywords", []),
        missing_keywords=result.get("missing_keywords", []),
        recommendation=result.get("recommendation", ""),
    )
    db.add(analysis)
    await db.flush()
    return analysis

@router.post("/rewrite", response_model=RewriteResponse)
async def rewrite(
    body: RewriteRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        rewritten = await rewrite_summary(body.resume_summary, body.jd_text)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")

    analysis = AiAnalysis(
        user_id=current_user.id,
        resume_text=body.resume_summary,
        jd_text=body.jd_text,
        rewritten_summary=rewritten,
    )
    db.add(analysis)
    await db.flush()
    return RewriteResponse(rewritten_summary=rewritten)


@router.post("/rewrite-resume", response_model=RewriteFullResponse)
async def rewrite_resume_full(
    body: RewriteFullRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = await rewrite_full_resume(body.resume_text, body.jd_text, body.missing_keywords)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")

    if "error" in result:
        raise HTTPException(status_code=502, detail=result["error"])

    analysis = AiAnalysis(
        user_id=current_user.id,
        resume_text=body.resume_text,
        jd_text=body.jd_text,
        rewritten_summary=str(result),
    )
    db.add(analysis)
    await db.flush()
    return RewriteFullResponse(rewritten_resume=result)


@router.get("/history", response_model=list[AiAnalysisResponse])
async def history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(AiAnalysis)
        .where(AiAnalysis.user_id == current_user.id)
        .order_by(AiAnalysis.created_at.desc())
        .limit(50)
    )
    return result.scalars().all()