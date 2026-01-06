SELECT
    "semestreRelativo", avg("notaFinal") as "promedio"
FROM "Cursacion"
         JOIN "Estudiante" using ("idEstudiante")
WHERE "rut" = $1
GROUP BY "semestreRelativo"
ORDER BY "semestreRelativo"

-- MIGRADO A NUEVO MODELO

/*
SELECT
    "semestreRelativo", avg("notaFinal") as "promedio"
FROM "Cursacion" WHERE "estudianteRut" = $1
GROUP BY "semestreRelativo"
ORDER BY "semestreRelativo"

-- VERSION ANTIGUA
  */