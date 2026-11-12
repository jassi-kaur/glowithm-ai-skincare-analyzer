from typing import List, Optional

from pydantic import BaseModel, Field


class SkincareRoutine(BaseModel):
    # min_length=1: an empty routine is invalid, so instructor re-asks the
    # model instead of silently returning nothing.
    morning: List[str] = Field(..., min_length=1)
    night: List[str] = Field(..., min_length=1)
    # The safety engine overwrites `conflicts` anyway, so a small model that
    # forgets it must not cause a validation failure (-> unnecessary fallback).
    conflicts: List[str] = Field(default_factory=list)
    # One or two plain sentences. The engine accepts it only if it passes
    # validation (no claims, no unlisted ingredients); otherwise a deterministic
    # template summary is used. Optional so a missing summary never fails a request.
    summary: Optional[str] = None
    # `tips` is no longer requested (the engine builds its own, so LLM tips were
    # discarded); the field stays optional for backwards compatibility.
    tips: Optional[List[str]] = None
    frequency: Optional[List[str]] = None
    alternate_nights: Optional[List[str]] = None
