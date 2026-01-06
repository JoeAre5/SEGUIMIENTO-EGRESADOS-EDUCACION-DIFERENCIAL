-- SELECT "agnio", round(cast(avg("notaFinal") as numeric),1) AS promedio
-- FROM "PlanContemplaAsignatura" pt
--          JOIN "Cursacion" c
--               ON (c."idAsignatura" = pt."idAsignatura")
--          JOIN "Plan" p
--               ON (p."id" = pt."idPlan" AND p."codigo" = $1)
-- WHERE pt."idAsignatura" = $2
-- GROUP BY "agnio";

-- MODELO NUEVO

SELECT 
  p."codigo" as "codigoPlan",
  p."titulo" as "tituloPlan",
  c."agnio" as "agnioRendicion",
  round(cast(avg("notaFinal") as numeric),2) AS "promedioHistorico"
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