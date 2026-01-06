-- SELECT
--     es."nombreCompleto",
--     a."nombre" as "tituloPractica",
--     pca."caracter",
--     pr."posicionRelativa" as "numeroPractica",
--     pt."fechaInicio",
--     pt."fechaTermino" as  "fechaFin",
--     cu."notaFinal"
-- FROM "Convenio" c JOIN "PracticaTomada" pt on (c."id" = pt."idConvenio")
--                   JOIN "Practica" pr on (pt."idPractica" = pr."id" and pt."idAsignatura" = pr."idAsignatura" and pt."idPlan" = pr."idPlan")
--                   JOIN "PlanContemplaAsignatura" pca on (pca."idAsignatura" = pr."idAsignatura" and pca."idPlan" = pr."idPlan")
--                   JOIN "Asignatura" a on (pca."idAsignatura" = a."id")
--                   JOIN "Cursacion" cu on (cu."idAsignatura" = pr."idAsignatura" and cu."idPlan" = pr."idPlan")
--                   JOIN "Estudiante" es on (es."rut" = cu."estudianteRut")
-- WHERE c."id" = $1;

-- modelo nuevo

SELECT DISTINCT
  est."nombreCompleto",
  asi."nombre" AS "tituloPractica",
  asi."caracter",
  (RANK() OVER (ORDER BY asi."posicion"))::numeric AS "numeroPractica",
  pto."fechaInicio",
  pto."fechaTermino" AS "fechaFin",
  cur."notaFinal",
  est."idEstudiante",
  mod."idModalidad",
  mod."nombreModalidad"
FROM "Convenio" con
JOIN "Modalidad" mod ON con."idModalidad" = mod."idModalidad"
JOIN "PTConvenio" ptc ON con."idConvenio" = ptc."idConvenio"
JOIN "PracticaTomada" pto ON ptc."idPlan" = pto."idPlan" AND ptc."idAsignatura" = pto."idAsignatura" AND ptc."idEstudiante" = pto."idEstudiante" AND ptc."idCursacion" = pto."idCursacion"
JOIN "Cursacion" cur ON pto."idPlan" = cur."idPlan" AND pto."idAsignatura" = cur."idAsignatura" AND pto."idEstudiante" = cur."idEstudiante" AND pto."idCursacion" = cur."idCursacion"
JOIN "Estudiante" est ON pto."idEstudiante" = est."idEstudiante"
JOIN "Asignatura" asi ON cur."idPlan" = asi."idPlan" AND cur."idAsignatura" = asi."idAsignatura"
WHERE con."idConvenio" = $1
order by 
  "fechaInicio", 
  "nombreCompleto";

