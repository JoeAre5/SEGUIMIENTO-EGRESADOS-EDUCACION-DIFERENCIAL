-- SELECT "agnio",
--        (sum(CASE WHEN "notaFinal" >= 4.0 THEN 1 ELSE 0 END)::numeric 
--        / count(1) * 100) AS aprobacion
-- FROM "PlanContemplaAsignatura" pt
        --  JOIN "Cursacion" c ON (c."idAsignatura" = pt."idAsignatura" AND pt."idAsignatura" = $1)
-- GROUP BY "agnio"

-- MODELO NUEVO

select 
  c."agnio",
  (
    sum(
      case when c."notaFinal" >= 4.0
      then 1 else 0 
      end
    )::numeric 
    / nullif(count(1), 0) * 100
  ) as aprobacion
from "Asignatura" a
join "Cursacion" c using ("idAsignatura")
where a."codigo" = $1
group by c."agnio"
order by c."agnio"
;