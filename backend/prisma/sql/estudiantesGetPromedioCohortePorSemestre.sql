SELECT
    "semestreRelativo", avg("notaFinal") as "promedio"
FROM "Cursacion" c
         JOIN "Estudiante" e using ("idEstudiante")
WHERE e."agnioIngreso" = $1
GROUP BY "semestreRelativo";

--MIGRADO A NUEVO MODELO

/*
SELECT
    "semestreRelativo", avg("notaFinal") as "promedio"
FROM "Cursacion" c
         JOIN "Estudiante" e ON (e."rut" = c."estudianteRut")
WHERE e."agnioIngreso" = $1
GROUP BY "semestreRelativo"

-- VERSION ANTIGUA

*/