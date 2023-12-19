import Box from "@mui/system/Box";
import ListColums from "./ListColumns/ListColumns";
import { mapOrder } from "~/utils/sorts";
import {
  DndContext,
  // PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners,
  pointerWithin,
  getFirstCollision,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useCallback, useEffect, useRef, useState } from "react";
import Column from "./ListColumns/Column/Column";
import Card from "./ListColumns/Column/ListCards/Card/Card";
import { cloneDeep, isEmpty } from "lodash";
import { generatePlaceholderCard } from "~/utils/formatters";
const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: "ACTIVE_DRAG_ITEM_TYPE_COLUMN",
  CARD: "ACTIVE_DRAG_ITEM_TYPE_CARD",
};

const BoardContent = ({ board }) => {
  // yêu cầu chuột di chuyển 10px thì mới kick hoạt event, fix trường hợp click chuột đã bị gọi event
  // const pointerSensor = useSensor(PointerSensor, {
  //   activationConstraint: { distance: 10 },
  // });

  // cảm ứng chuột di chuyeerb 10 px, mới thực hiện event
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 10 },
  });
  // cảm ứng chạm...
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 500 },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const [orderedColumns, setOrderedColumns] = useState([]);

  // cùng một điểm chỉ có một phần tử được kéo (column hoặc card)
  const [activeDragItemId, setActiveDragItemId] = useState(null);
  const [activeDragItemType, setActiveDragItemType] = useState(null);
  const [activeDragItemData, setActiveDragItemData] = useState(null);
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] =
    useState(null);

  // điểm va chạm cuối cùng(xử lý thuật toán phát hiện va chạm)
  const lastOverId = useRef(null);

  useEffect(() => {
    setOrderedColumns(mapOrder(board?.columns, board?.columnOrderIds, "_id"));
  }, [board]);

  // function chung cập nhật lại state khi kéo card qua 2 column khác nhau
  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData
  ) => {
    setOrderedColumns((prevColumns) => {
      const overCardIndex = overColumn?.cards?.findIndex(
        (card) => card._id === overCardId
      );

      let newCardIndex;
      const isBelowOverItem =
        active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height;

      const modifier = isBelowOverItem ? 1 : 0;

      newCardIndex =
        overCardIndex >= 0
          ? overCardIndex + modifier
          : overColumn?.cards?.length + 1;

      const nextColumns = cloneDeep(prevColumns);
      const nextActiveColumn = nextColumns.find(
        (column) => column._id === activeColumn._id
      );
      const nextOverColumn = nextColumns.find(
        (column) => column._id === overColumn._id
      );

      if (nextActiveColumn) {
        // xóa card ở cái column active
        nextActiveColumn.cards = nextActiveColumn.cards.filter(
          (card) => card._id !== activeDraggingCardId
        );

        // thêm placeholder card nếu column rỗng:
        if (isEmpty(nextActiveColumn.cards)) {
          nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)];
        }

        // xóa cái placeholder card đi nếu nó đang tồn tại
        nextActiveColumn.cards = nextActiveColumn.cards.filter(
          (card) => !card.FE_PlaceholderCard
        );

        // cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu (Loc ra card nào k có cái FE_PlaceholderCard)
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(
          (card) => card._id
        );
      }
      if (nextOverColumn) {
        nextOverColumn.cards = nextOverColumn.cards.filter(
          (card) => card._id !== activeDraggingCardId
        );

        //phải cập nhật lại columnId trong cards khi kéo thả card giữa 2 column khác nhau
        const rebuild_activeDragItemData = {
          ...activeDraggingCardData,
          columnId: nextOverColumn._id,
        };

        nextOverColumn.cards = nextOverColumn.cards.toSpliced(
          newCardIndex,
          0,
          rebuild_activeDragItemData
        );
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(
          (card) => card._id
        );
      }
      return nextColumns;
    });
  };
  // khi bắt đầu kéo một phần tử
  const handleDragStart = (event) => {
    setActiveDragItemId(event?.active?.id);
    setActiveDragItemType(
      event?.active?.data?.current?.columnId
        ? ACTIVE_DRAG_ITEM_TYPE.CARD
        : ACTIVE_DRAG_ITEM_TYPE.COLUMN
    );
    setActiveDragItemData(event?.active?.data?.current);

    // nếu là kéo card thì mới thực hiện hành động set giá trị oldcolumn
    if (event?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id));
    }
  };

  const findColumnByCardId = (cardId) => {
    return orderedColumns.find((column) =>
      column.cards.map((card) => card._id)?.includes(cardId)
    );
  };
  // trigger trong quá trình kéo(drag) một phần tử
  const handleDragOver = (event) => {
    // không làm gì nếu kéo column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return;

    // nếu kéo card thì xử lí thêm để có thể kéo card qua lại giữa các columns
    // console.log("handleDragOver: ", event);
    const { active, over } = event;

    // nếu không tồn tại active hoặc over (khi kéo ra khỏi phạm vi container) thì không làm gì
    if (!over || !active) return;

    const {
      id: activeDraggingCardId,
      data: { current: activeDraggingCardData }, //activeDraggingCardData là dữ liệu card đang kéo
    } = active;
    const { id: overCardId } = over;

    const activeColumn = findColumnByCardId(activeDraggingCardId);
    const overColumn = findColumnByCardId(overCardId);

    // nếu không tồn tại 1 trong 2 column thì không làm gì hết
    if (!activeColumn || !overColumn) return;

    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDifferentColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData
      );
    }
  };

  // khi kết thúc hành động kéo (drag) một phần tử => hành động thả (drop)
  const handleDragEnd = (event) => {
    const { active, over } = event;
    // nếu không tồn tại active hoặc over (khi kéo ra khỏi phạm vi container) thì không làm gì
    if (!over || !active) return;

    // xử lí kéo thả card
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      const {
        id: activeDraggingCardId,
        data: { current: activeDraggingCardData }, //activeDraggingCardData là dữ liệu card đang kéo
      } = active;
      const { id: overCardId } = over;

      const activeColumn = findColumnByCardId(activeDraggingCardId);
      const overColumn = findColumnByCardId(overCardId);

      // nếu không tồn tại 1 trong 2 column thì không làm gì hết
      if (!activeColumn || !overColumn) return;

      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        // hành động kéo thả card giữa 2 column khác
        moveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData
        );
      } else {
        // hành động kéo thả card trong cùng 1 column
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(
          (c) => c._id === activeDragItemId
        );
        const newCardIndex = overColumn?.cards?.findIndex(
          (c) => c._id === overCardId
        );

        const dndOrderedCards = arrayMove(
          oldColumnWhenDraggingCard?.cards,
          oldCardIndex,
          newCardIndex
        );

        setOrderedColumns((prevColumns) => {
          const nextColumns = cloneDeep(prevColumns);

          // tìm tới column mà chúng ta đang thả
          const targetColumn = nextColumns.find(
            (column) => column._id === overColumn._id
          );
          // cập nhật lại 2 giá trị mới là card và cardOrderIds trong cái targetColumn
          targetColumn.cards = dndOrderedCards;
          targetColumn.cardOrderIds = dndOrderedCards.map((card) => card._id);
          return nextColumns;
        });
      }
    }

    // xử lí kéo thả column
    if (
      activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN &&
      active.id !== over.id
    ) {
      // nếu vị trí sau kéo thả khác vị trí ban đầu
      // lấy vị trí cũ từ thằng active
      const oldColumnIndex = orderedColumns.findIndex(
        (c) => c._id === active.id
      );
      const newColumnIndex = orderedColumns.findIndex((c) => c._id === over.id);

      // mảng columns sau khi đã kéo thả
      const dndOrderedColumns = arrayMove(
        orderedColumns,
        oldColumnIndex,
        newColumnIndex
      );

      // cai này để sau này dùng để xử lý dữ liệu gọi API

      // const dndOrderedColumnsIds = dndOrderedColumns.map((c) => c._id);
      // console.log("dndOrderedColumns", dndOrderedColumns);
      // console.log("dndOrderedColumnsIds", dndOrderedColumnsIds);
      // cập nhật lại state ban đầu sau khi kéo thả

      setOrderedColumns(dndOrderedColumns);
    }
    setOldColumnWhenDraggingCard(null);
    setActiveDragItemId(null);
    setActiveDragItemType(null);
    setActiveDragItemData(null);
  };

  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.5",
        },
      },
    }),
  };

  const collisionDetectionStrategy = useCallback(
    (args) => {
      if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
        return closestCorners({ ...args });
      }

      const pointerIntersections = pointerWithin(args);

      if (!pointerIntersections?.length) return;
      // const intersections =
      //   pointerIntersections?.length > 0
      //     ? pointerIntersections
      //     : rectIntersection(args);

      let overId = getFirstCollision(pointerIntersections, "id");
      if (overId) {
        const checkColumn = orderedColumns.find(
          (column) => column._id === overId
        );
        if (checkColumn) {
          // console.log("overId before", overId);
          overId = closestCorners({
            ...args,
            droppableContainers: args.droppableContainers.filter(
              (container) => {
                return (
                  container.id !== overId &&
                  checkColumn?.cardOrderIds?.includes(container.id)
                );
              }
            ),
          })[0]?.id;
          // console.log("overId after", overId);
        }
        lastOverId.current = overId;
        return [{ id: overId }];
      }
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },

    [activeDragItemType, orderedColumns]
  );
  return (
    <DndContext
      sensors={sensors}
      // collisionDetection={closestCorners}
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
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
        <DragOverlay dropAnimation={customDropAnimation}>
          {!activeDragItemType && null}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN && (
            <Column column={activeDragItemData} />
          )}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD && (
            <Card card={activeDragItemData} />
          )}
        </DragOverlay>
      </Box>
    </DndContext>
  );
};

export default BoardContent;
