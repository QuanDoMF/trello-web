import { useState } from "react";
import { toast } from 'react-toastify'
import Box from "@mui/system/Box";
import Column from "./Column/Column";
import { Button } from "@mui/material";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import TextField from "@mui/material/TextField";
import CloseIcon from "@mui/icons-material/Close";

import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
const ListColums = ({ columns }) => {
  const [openNewColumnForm, setOpenNewColumnForm] = useState(false)
  const [newColumnTitle, setNewColumnTitle] = useState('')
  const toggleOpenNewColumnForm = () => {
    setOpenNewColumnForm(!openNewColumnForm)
  }
  const addNewColumn = () => {
    if (!newColumnTitle) {
      toast.error('Please enterr Column title')
    }
    // console.log(newColumnTitle)
    //  gọi API ở đây
    toggleOpenNewColumnForm()
    setNewColumnTitle('')
  }
  return (
    <SortableContext
      items={columns?.map((c) => c._id)}
      strategy={horizontalListSortingStrategy}
    >
      {/* horizontalListSortingStrategy là kiểu tối ưu cho cái kéo thả nằm ngang */}
      <Box
        sx={{
          bgcolor: "inherit",
          width: "100%",
          height: "100%",
          display: "flex",
          overflowX: "auto",
          overflowY: "hidden",
          "&::-webkit-scrollbar-track": {
            m: 2,
          },
        }}
      >
        {/* Box column test 01 */}
        {columns?.map((column) => {
          return <Column key={column._id} column={column} />;
        })}

        {/*Box add new column  */}
        {
          !openNewColumnForm
            ? <Box onClick={toggleOpenNewColumnForm}
              sx={{
                minWidth: "250px",
                maxWidth: "250px",
                mx: 2,
                borderRadius: "6px",
                height: "fit-content",
                bgcolor: "#ffffff3d",
              }}
            >
              <Button
                startIcon={<NoteAddIcon />}
                sx={{
                  color: "white",
                  width: "100%",
                  justifyContent: "flex-start",
                  pl: 2.5,
                  py: 1,
                }}
              >
                Add new column
              </Button>
            </Box>
            : <Box sx={{
              minWidth: '250px',
              maxWidth: '250px',
              mx: 2,
              p: 1,
              borderRadius: '6px',
              height: 'fit-content',
              bgcolor: '#ffffff3d',
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}
            >
              <TextField
                // sx={{ minWidth: "120px" }}
                label="Enter column title"
                type="text"
                size="small"
                variant="outlined"
                autoFocus
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                sx={{
                  "& label": { color: "white" },
                  "& input": { color: "white" },
                  "& label.Mui-focused": { color: "white" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "white",
                    },
                    "&:hover fieldset": {
                      borderColor: "white",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "white",
                    },
                  },
                }}
              />

              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
              >
                <Button
                  onClick={addNewColumn}
                  variant="contained"
                  color="success"
                  size="small"
                  sx={{
                    boxShadown: 'none',
                    border: '0.5px solid',
                    borderColor: (theme) => theme.palette.success.main,
                    '&:hover': { bgcolor: (theme) => theme.palette.success.main }
                  }}
                >
                  Add Column
                </Button>
                <CloseIcon
                  fontSize="small"
                  sx={{
                    color: "white",
                    cursor: "pointer",
                    '&:hover': { color: (theme) => theme.palette.warning.light }
                  }}
                  onClick={toggleOpenNewColumnForm}
                />
              </Box>
            </Box>
        }
      </Box>
    </SortableContext>
  );
};
export default ListColums;
