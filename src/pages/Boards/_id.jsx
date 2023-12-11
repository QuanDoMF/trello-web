// import Box from "@mui/system/Box";
import { Container } from "@mui/material";
import AppBar from "../../components/AppBar";
import BoardBar from "./BoardBar";
import BoardContent from "./BoardContent";
const Board = () => {
  return (
    <Container disableGutters maxWidth={true} sx={{ height: "100vh" }}>
      <AppBar />
      <BoardBar />
      <BoardContent />
    </Container>
  );
};
export default Board;
