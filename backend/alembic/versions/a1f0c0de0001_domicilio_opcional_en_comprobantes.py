"""domicilio_opcional_en_comprobantes

Revision ID: a1f0c0de0001
Revises: b57c9546ab17
Create Date: 2026-10-30 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1f0c0de0001'
down_revision: Union[str, Sequence[str], None] = 'b57c9546ab17'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column('comprobantes', 'domicilio_remitente', existing_type=sa.String(), nullable=True)
    op.alter_column('comprobantes', 'domicilio_destinatario', existing_type=sa.String(), nullable=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("UPDATE comprobantes SET domicilio_remitente = '-' WHERE domicilio_remitente IS NULL")
    op.execute("UPDATE comprobantes SET domicilio_destinatario = '-' WHERE domicilio_destinatario IS NULL")
    op.alter_column('comprobantes', 'domicilio_destinatario', existing_type=sa.String(), nullable=False)
    op.alter_column('comprobantes', 'domicilio_remitente', existing_type=sa.String(), nullable=False)
