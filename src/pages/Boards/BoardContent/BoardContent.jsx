import Box from "@mui/system/Box";
import ListColums from "./ListColumns/ListColumns";
const BoardContent = () => {
  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: (theme) =>
          theme.palette.mode === "dark" ? "#34495e" : "#1976d2",
        height: (theme) => theme.trello.boardContentHeight,
        p: "10px 0",
      }}
    >
      <ListColums />
    </Box>
  );
};

export default BoardContent;
