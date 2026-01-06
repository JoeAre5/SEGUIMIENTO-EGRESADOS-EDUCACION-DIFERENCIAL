-- SELECT "agnio", round(cast(avg("notaFinal") as numeric),1) AS promedio
-- FROM "PlanContemplaAsignatura" pt
--          JOIN "Cursacion" c using ("idAsignatura")
-- WHERE pt."idAsignatura" = $1
-- GROUP BY "agnio"

-- MODELO NUEVO

SELECT 
  "agnio", 
  round(cast(avg("notaFinal") as numeric), 2) AS promedio
from "Cursacion" c
join "Asignatura" a using ("idPlan","idAsignatura")
where a."codigo" = $1
group by "agnio"
order by c."agnio";