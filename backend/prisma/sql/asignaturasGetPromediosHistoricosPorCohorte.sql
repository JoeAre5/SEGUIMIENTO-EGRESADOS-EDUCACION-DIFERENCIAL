-- SELECT 
--      "agnio", 
--      "agnioIngreso", 
--      p."titulo", 
--      round(
--           cast(
--                avg("notaFinal") as numeric
--           ),
--      1) AS promedio
-- FROM "PlanContemplaAsignatura" pt
-- JOIN "Cursacion" c ON (c."idAsignatura" = pt."idAsignatura" AND pt."idAsignatura" = $1)
-- JOIN "Estudiante" e on (e."rut" = c."estudianteRut")
-- JOIN "Plan" p on (p."id" = pt."idPlan")
-- GROUP BY "agnio", "agnioIngreso", p."titulo";

-- MODELO NUEVO

select 
  p."codigo" as "codigoPlan",
  p."titulo" as "tituloPlan",
  e."agnioIngreso" as "cohorte",
  c."agnio" as "agnioRendicion",
  round(
      avg("notaFinal")::numeric, 
      2
  ) as "promedioAnual"
from "Cursacion" c
join "Asignatura" a using ("idPlan", "idAsignatura")
join "Estudiante" e using ("idEstudiante")
join "Plan" p on (c."idPlan" = p."idPlan")
where a."codigo" = $1
group by 
  p."codigo",
  p."titulo",
  e."agnioIngreso", 
  c."agnio"
order by 
  p."codigo",
  p."titulo",
  e."agnioIngreso",
  c."agnio"