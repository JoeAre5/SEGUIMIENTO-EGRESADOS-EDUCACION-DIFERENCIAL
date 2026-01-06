-- SELECT
--     "agnio",
--     "agnioIngreso",
--     "titulo",
--     (sum(CASE WHEN "notaFinal" >= 4.0 THEN 1 ELSE 0 END)::numeric / count(1) * 100) AS aprobacion
-- FROM "PlanContemplaAsignatura" pt
--          JOIN "Cursacion" c ON (c."idAsignatura" = pt."idAsignatura" AND pt."idAsignatura" = $1)
--     --
--          JOIN "Estudiante" e on (e."rut" = c."estudianteRut")
--     --
--          JOIN "Plan" p on (p."id" = pt."idPlan")
-- GROUP BY "agnio", "agnioIngreso", "titulo"

-- Modelo Nuevo

select 
	p."codigo" as "codigoPlan",
  p."titulo" as "tituloPlan",
  e."agnioIngreso" as "cohorte",
  c."agnio" as "agnioRendicion",
	(
			sum(
						case when "notaFinal" >= 4.0
						then 1 else 0 end
			)::numeric
			/ nullif(count(1), 0) 
			* 100
	) as "aprobacionAnual"
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
