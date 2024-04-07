// import Box from "@mui/system/Box";
import { Container } from "@mui/material";
import AppBar from "~/components/AppBar/AppBar";
import BoardBar from "./BoardBar/BoardBar";
import BoardContent from "./BoardContent/BoardContent";
import { useEffect, useState } from "react";
import { fetchBoardDetailsAPI } from "~/apis";
const Board = () => {
  const [board, setBoard] = useState([])
  useEffect(() => {
    const boardId = '6607df5d6cb9760cc225f561'
    fetchBoardDetailsAPI(boardId).then(board => {
      setBoard(board)
    })
  }, [])
  return (
    <Container disableGutters maxWidth={true} sx={{ height: "100vh" }}>
      <AppBar />
      <BoardBar board={board} />
      <BoardContent board={board} />
    </Container>
  );
};
export default Board;
