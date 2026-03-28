-- Rename UserRole enum values: Rishika -> Juliet, DSP -> Romeo
-- Using ALTER TYPE ... RENAME VALUE (PostgreSQL 10+)
ALTER TYPE "UserRole" RENAME VALUE 'Rishika' TO 'Juliet';
ALTER TYPE "UserRole" RENAME VALUE 'DSP' TO 'Romeo';
