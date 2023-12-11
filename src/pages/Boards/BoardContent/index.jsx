import Box from "@mui/system/Box";

const BoardContent = () => {
  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "primary.main",
        display: "flex",
        height: (theme) =>
          `calc(100vh - ${theme.trello.appBarHeight} - ${theme.trello.boardBarHeight})`,
        alignItems: "center",
      }}
    >
      Board content
    </Box>
  );
};

export default BoardContent;
