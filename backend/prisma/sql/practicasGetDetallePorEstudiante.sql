-- SELECT
--     cn."titulo",
--     c."notaFinal",
--     pr."posicionRelativa" as "numeroPractica",
--     pr."nombre" as "nombrePractica",
--     c."numIntento",
--     cn."centroPractica",
--     m."nombreModalidad"
-- FROM "Convenio" cn
--     JOIN "Modalidad" m ON (m."id" = cn."idModalidad")
--     JOIN "PracticaTomada" pt ON (pt."idConvenio" = cn."id")
--     JOIN "Estudiante" e ON (e."id"=pt."idEstudiante" AND e."id"=$1)
--     JOIN "Cursacion" c ON (
--     c."estudianteRut" = e."rut" AND
--     c."idAsignatura" = pt."idAsignatura"
--     )
--     JOIN "PlanContemplaAsignatura" pc ON (pc."idAsignatura" = c."idAsignatura" and pc."idPlan" = pt."idPlan")
--     JOIN "Practica" pr ON (pr."idAsignatura" = pc."idAsignatura" and pc."idPlan" = pr."idPlan")
-- ORDER BY "numeroPractica";

--- modelo nuevo

select 
    cur."idCursacion",
    cur."notaFinal",
    asi."codigo" as "codigoAsignatura",
    asi."nombre" as "nombrePractica",
    pla."titulo" as "plan",
    cur."numIntento",
    (
        rank() over (order by asi."posicion")
    )::numeric as "posicionRelativa",
    array_agg(con."titulo") as "convenios",
    array_agg(con."centroPractica") as "centrosDePractica",
    array_agg(mod."nombreModalidad") as "modalidades"
from "Cursacion" cur
join "Estudiante" est using ("idEstudiante")
join "Asignatura" asi on (
    cur."idAsignatura" = asi."idAsignatura"
and cur."idPlan" = asi."idPlan"
)
join "Plan" pla on (cur."idPlan" = pla."idPlan")
join "PracticaTomada" pto on (
    cur."idPlan" = pto."idPlan" 
and cur."idAsignatura" = pto."idAsignatura" 
and cur."idEstudiante" = pto."idEstudiante"
and cur."idCursacion" = pto."idCursacion"
)
join "PTConvenio" ptc on (
    pto."idPlan" = ptc."idPlan"
and pto."idAsignatura" = ptc."idAsignatura"
and pto."idEstudiante"= ptc."idEstudiante"
and pto."idCursacion"= ptc."idCursacion"
)
join "Convenio" con using ("idConvenio")
join "Modalidad" mod using ("idModalidad")
where est."idEstudiante" = $1
group by 
    cur."idCursacion",
    cur."notaFinal", 
    asi."codigo",
    asi."nombre", 
    pla."titulo",
    asi."posicion",
    cur."numIntento"
;


/*
SELECT
    cn."titulo",
    cu."notaFinal",
    pt."posicionRelativa",
    asig."nombre",
    cu."numIntento",
    cn."centroPractica",
    mo."nombreModalidad"
FROM "Convenio" cn JOIN "Modalidad" mo ON (mo.id = cn."idModalidad")
    JOIN "PTConvenio" ptc ON (ptc.idConvenio = cn."id")
    JOIN "PracticaTomada" pt ON (
        ptc."idPlan" = pt."idPlan" and ptc."idAsignatura" = pt."idAsignatura"  and
        ptc."idEstudiante" = pt."idEstudiante" and ptc."idCursacion" = pt."idCursacion"
    )
    ...
*/
--    TODO: ESPERAR A QUE SE SOLUCIONE EL TEMA DE LA MEJORA AL ESQUEMA
