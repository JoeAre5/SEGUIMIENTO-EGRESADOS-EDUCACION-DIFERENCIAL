-- --obtiene el porcentaje de aprobacion de un convenio
-- WITH notasFinales as (
--     SELECT c."notaFinal"
--     FROM "PracticaTomada" pt
--     JOIN "Estudiante" e ON (pt."idEstudiante" = e."id")
--     JOIN "Convenio" cn ON (cn."id" = pt."idConvenio")
--     JOIN "Cursacion" c 
--         ON (
--             c."estudianteRut" = e."rut" 
--         AND c."idAsignatura" = pt."idAsignatura"
--         )

--     WHERE "idConvenio" = $1
-- )
-- --PORCENTAJE DE APROBACION
-- SELECT 
--     (
--         SUM(
--             CASE WHEN "notaFinal" > 4.0 
--             THEN 1 END
--         ) / nullif(COUNT(1), 0) 
--         * 100
--     )::numeric as porcentajeAprobacion
-- FROM notasFinales
-- LIMIT 1;

-- MODELO NUEVO

select 
    nullif(
        (
            "porcentajeAprobacion"::numeric 
            / "cuenta"::numeric
        ), 0
    ) as "porcentajeAprobacion"
from (
  select
    count(*) as "cuenta",
    sum(
      case when cur."notaFinal" > 4.0
      then 1 end
    ) * 100
    as "porcentajeAprobacion"
  from "Convenio" con
  join "PTConvenio" ptc using ("idConvenio")
  join "PracticaTomada" pto using ("idPlan", "idAsignatura", "idEstudiante", "idCursacion")
  join "Cursacion" cur using ("idPlan", "idAsignatura", "idEstudiante", "idCursacion")
  where con."idConvenio" = $1
  group by 
    con."idConvenio"
) as "vistaAprobacion"