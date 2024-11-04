import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { publicacionesService } from "../services/publicaciones.service";
import { calificacionesService } from "../services/calificaciones.service";
import { PublicacionConCalificacion, PublicacionResponse } from "../types";

const usePublicaciones = (searchQuery: string, currentPage: number) => {
  const [publicaciones, setPublicaciones] = useState<
    PublicacionConCalificacion[]
  >([]);
  const [uniquePublicacion, setUniquePublicacion] =
    useState<PublicacionConCalificacion>();
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const location = useLocation();
  const publicacionId = useParams().id;

  useEffect(() => {
    const fetchServicios = async () => {
      setLoading(true);
      const params = new URLSearchParams(location.search);
      const nombreCategoria = params.get("nombreCategoria");
      const descripcion = searchQuery || params.get("descripcion");
      const page = currentPage;

      try {
        let data: PublicacionResponse;
        if (publicacionId) {
          const publicacion = await publicacionesService.getPublicacion(
            parseInt(publicacionId)
          );
          const calificacion =
            await calificacionesService.getCalificacionByPublicacionId(
              publicacion.publicacionId
            );
          setUniquePublicacion({
            ...publicacion,
            calificacion: calificacion || { calificacionGeneral: 0 },
          });
          setLoading(false);
          return;
        } else if (nombreCategoria) {
          data = await publicacionesService.getPublicacionesByCategoriaNombre(
            nombreCategoria,
            page
          );
        } else if (descripcion) {
          data = await publicacionesService.getPublicacionesByDescripcion(
            descripcion,
            page
          );
        } else {
          data = await publicacionesService.getPublicaciones(page);
        }

        const publicacionesConCalificacion = await Promise.all(
          data.content.map(async (publicacion) => {
            const calificacion =
              await calificacionesService.getCalificacionByPublicacionId(
                publicacion.publicacionId
              );
            return {
              ...publicacion,
              calificacion: calificacion || { calificacionGeneral: 0 },
            };
          })
        );

        setPublicaciones(publicacionesConCalificacion);
        setTotalPages(data.page.totalPages);
      } catch (error) {
        console.error("Error fetching publicaciones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServicios();
  }, [searchQuery, currentPage, location.search, publicacionId]);

  return { publicaciones, uniquePublicacion, loading, totalPages };
};

export default usePublicaciones;