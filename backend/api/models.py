from sqlalchemy import Column, Integer, String, Numeric, Text
from api.core.database import Base


class Workout(Base):
    """Workout model for database.
    Attributes:
        id: unique identifier
        name: name for workout
        pace: target pace
        time: target duration
        distance: target distance
        notes: additional info on the workout
    """
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    pace = Column(String(5), nullable=True)
    time = Column(String(8), nullable=True)
    distance = Column(Numeric(precision=4, scale=2), nullable=True)
    notes = Column(Text, nullable=True)
