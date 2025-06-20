
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";


import { Plus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchMovies } from "@/features/movie/movieSlice";
import MovieDialog from "@/components/admin/MovieDialog";
import { Movie } from "@/data/type";
import { DataTable } from "@/components/admin/DataTable";
import { createMovieColumns } from "@/components/admin/columns/createMovieColumns";
import { ConfirmDeleteDialog } from "@/components/dialogs/ConfirmDeleteDialog";

const AdminMovies = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const dispatch = useAppDispatch();
  const { movies, loading, error } = useAppSelector((state) => state.movie);

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  useEffect(() => {
    dispatch(fetchMovies()); // Gọi API để lấy danh sách phim
  }, [dispatch]);


  const filteredMovies = Object.values(movies).filter(movie =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddMovieDialog = () => {
    setSelectedMovie(null);
    setIsOpen(true);
  };

  const openEditMovieDialog = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsOpen(true);
  }

  const openDeleteMovieDialog = (movie: Movie) => {
    setSelectedMovie(movie);
    setOpenDeleteDialog(true);
  }

  const columns = createMovieColumns({
    onViewDetail: openEditMovieDialog,
    onDelete: openDeleteMovieDialog,
  });

  const confirmDelete = () => {
    if (selectedMovie) {
      // Gọi API để xóa phim
      // dispatch(deleteMovie(selectedMovie.id));
      console.log(`Xóa phim: ${selectedMovie.title}`);
    }
    setOpenDeleteDialog(false);
    setSelectedMovie(null);
  }


  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Quản lý phim</h1>
          <Button onClick={openAddMovieDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm phim mới
          </Button>
        </div>

        <DataTable data={filteredMovies} columns={columns} />
      </div>
      {/* Hidden components */}
      <MovieDialog open={isOpen} setOpen={setIsOpen}
        movie={selectedMovie} />
      <ConfirmDeleteDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={confirmDelete}
        objectName={selectedMovie?.title}
      />
    </>

  );
};

export default AdminMovies;
