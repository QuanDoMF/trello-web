import Box from "@mui/system/Box";
import ListColums from "./ListColumns/ListColumns";
import { mapOrder } from "~/utils/sorts";
const BoardContent = ({ board }) => {
  const orderedColumns = mapOrder(board?.columns, board?.columnOrderIds, "_id");
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
      <ListColums columns={orderedColumns} />
    </Box>
  );
};

export default BoardContent;
