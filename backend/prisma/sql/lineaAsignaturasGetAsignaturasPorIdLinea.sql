--MODELO ANTIGUO

-- SELECT distinct
--     la."titulo",
--     a."id" as "idAsignatura",
--     a."codigo",
--     a."nombre",
--     "areaFormacion" from "PlanContemplaAsignatura" pca
--         JOIN "Asignatura" a on (a."id" = pca."idAsignatura")
--         LEFT JOIN "LineaContemplaAsignatura" lca on (lca."idAsignatura" = a."id")
--         LEFT JOIN "LineaAsignatura" la on ("idLinea" = la."id")
-- WHERE pca."idPlan" = $1
-- ORDER BY la."titulo";

-- MODELO NUEVO (ACTIVAR AL CAMBIAR DE RAMA!!!!!!)

SELECT distinct
    la."titulo",
    a."posicion",
    a."idAsignatura",
    a."codigo",
    a."nombre",
    a."areaFormacion"
FROM "Asignatura" a
LEFT JOIN "LineaAsignatura" la using ("idLinea")
WHERE a."idPlan" = $1
order by a."posicion" asc;

