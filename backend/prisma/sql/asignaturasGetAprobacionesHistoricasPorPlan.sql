-- SELECT
--     "agnio",
--     (sum(CASE WHEN "notaFinal" >= 4.0 THEN 1 ELSE 0 END)::numeric / count(*) * 100) AS aprobacion
-- FROM "PlanContemplaAsignatura" pt
--          JOIN "Cursacion" c ON (c."idAsignatura" = pt."idAsignatura" AND pt."idAsignatura" = $2)
--          JOIN "Plan" p ON (p."id" = pt."idPlan" AND p."codigo" = $1)
-- GROUP BY "agnio"

-- MODELO NUEVO

SELECT 
  p."codigo" as "codigoPlan",
  p."titulo" as "tituloPlan",
  c."agnio" as "agnioRendicion",
  (
    sum(
      CASE WHEN "notaFinal" >= 4.0 
        THEN 1 ELSE 0 END
    )::numeric
    / nullif(count(*), 0) 
    * 100
  ) AS "aprobacionHistorica"
from "Cursacion" c
join "Asignatura" a using ("idPlan","idAsignatura")
join "Plan" p using ("idPlan")
where a."codigo" = $1
  and p."codigo" = $2
group by 
  p."codigo",
  p."titulo",
  c."agnio"
order by
  p."codigo",
  p."titulo",
  c."agnio"
;