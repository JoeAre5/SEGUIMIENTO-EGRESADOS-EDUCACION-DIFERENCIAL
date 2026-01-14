SELECT
  e."nombreCompleto",
  e."rut",
  e."agnioIngreso",
  p."titulo" AS "plan",
  (
    SELECT AVG(c."notaFinal")
    FROM "Cursacion" c
    WHERE c."idEstudiante" = e."idEstudiante"
  ) AS "promedio"
FROM "Estudiante" e
JOIN "Plan" p ON e."idPlan" = p."idPlan"
WHERE e."idEstudiante" = $1
LIMIT 1;

--MIGRADO A NUEVO MODELO

/*
SELECT
    e."nombreCompleto",
    e."rut",
    e."agnioIngreso",
    (select max("anio") from "Plan" where "anio" <= e."agnioIngreso") as "plan",
    avg("notaFinal") over (partition by "estudianteRut") as promedio
FROM "Estudiante" e
         JOIN "Cursacion" c ON (e."rut"=c."estudianteRut")
WHERE e."id" = $1
LIMIT 1;

--VERSION ANTIGUA
*/