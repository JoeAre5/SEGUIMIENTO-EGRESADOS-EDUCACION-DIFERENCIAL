-- -- obtiene el promedio de notas finales en las practicas de un convenio
-- SELECT AVG(c."notaFinal") as "promedioPracticas"
-- FROM "PracticaTomada" pt
--     JOIN "Estudiante" e ON (pt."idEstudiante" = e."id")
--     JOIN "Convenio" cn ON (
--         cn."id" = pt."idConvenio"
--     )
--     JOIN "Cursacion" c ON (
--         c."estudianteRut" = e."rut" AND
--         c."idAsignatura" = pt."idAsignatura"
--     )
-- WHERE "idConvenio" = $1;

-- MODELO NUEVO

select 
    (
        avg(cur."notaFinal")
    )
    as "promedioPracticas"
from "Convenio" con
join "PTConvenio" ptc using ("idConvenio")
join "PracticaTomada" pto using ("idPlan", "idAsignatura", "idEstudiante", "idCursacion")
join "Cursacion" cur using ("idPlan", "idAsignatura", "idEstudiante", "idCursacion")
where con."idConvenio" = $1
group by 
    con."idConvenio"