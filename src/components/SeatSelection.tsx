import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Seat, SeatType, Showtime } from "@/data/type";
import formatCurrency from "@/lib/formatCurrency";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import {
  setSelectedSeats,
  updateSeatsStatusByIds,
} from "@/features/seat/seatSlice";
import { useAuth } from "@/contexts/AuthContext";

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL;

const seatStatuses = [
  { color: "bg-cinema-primary", label: "Selected" },
  { color: "bg-gray-500 opacity-50", label: "Unavailable" },
  { color: "bg-green-500", label: "Available" },
  { color: "bg-gray-500 cursor-not-allowed", label: "Reserved" },
];

interface SeatSelectionProps {
  bookingId: number;
  showtime: Showtime;
}

const SeatSelection = ({ bookingId, showtime }: SeatSelectionProps) => {
  const { user } = useAuth();
  useEffect(() => {
    const ws = new WebSocket(`${WS_BASE_URL}booking/${showtime.id}/`);
    ws.onopen = () => {
      console.log("WebSocket connection established");
      ws.send(JSON.stringify({ type: "join", bookingId }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WebSocket message received:", data);

      // Nếu message là do chính mình gửi, bỏ qua
      if (data.sender_id && data.sender_id === user.id) return;

      if (data.type === "seat_added") {
        dispatch(
          updateSeatsStatusByIds({ ids: [data.seat_id], status: "reserved" })
        );
      } else if (data.type === "seat_removed") {
        dispatch(
          updateSeatsStatusByIds({ ids: [data.seat_id], status: "available" })
        );
      }
    };

    ws.onerror = (err) => console.error("WebSocket error", err);
    return () => {
      ws.close();
    };
  }, [showtime.id]);

  const dispatch = useDispatch();
  const seats = useSelector((state: RootState) => state.seat.seats);
  const selectedSeats = useSelector(
    (state: RootState) => state.seat.selectedSeats
  );
  // Get unique seat types
  const seatTypesMap = new Map();

  seats.forEach((seat) => {
    const st = seat.seat_type;
    if (!seatTypesMap.has(st.id)) {
      seatTypesMap.set(st.id, st);
    }
  });

  const seatTypes: SeatType[] = Array.from(seatTypesMap.values()).sort(
    (a, b) => a.extra_price - b.extra_price
  );

  const toggleSeat = async (seat: Seat) => {
    if (!bookingId) {
      toast.error("Đã có lỗi xảy ra, session chưa được khởi tạo!");
      return;
    }

    if (seat.status === "reserved" || seat.status === "unavailable") return;

    const isSelected = selectedSeats.some((s) => s.id === seat.id);
    try {
      if (isSelected) {
        // Gọi API xoá ghế
        await axiosInstance.delete(
          `/bookings/${bookingId}/remove-seat/${seat.id}/`
        );

        const updatedSelectedSeats = selectedSeats.filter(
          (s) => s.id !== seat.id
        );
        dispatch(setSelectedSeats(updatedSelectedSeats));
      } else {
        // Gọi API thêm ghế
        await axiosInstance.post(`/bookings/${bookingId}/add-seat/${seat.id}/`);

        const updatedSelectedSeats = [
          ...selectedSeats,
          { ...seat, status: "selected" as const },
        ];
        dispatch(setSelectedSeats(updatedSelectedSeats));
      }
    } catch (error: any) {
      console.error("Seat API error", error);
      toast.error(error.response?.data?.error || "Không thể cập nhật ghế.");
    }
  };

  const handleConfirm = () => {
    // onSeatsSelected(selectedSeats);
  };

  const rows = Array.from(new Set(seats.map((seat) => seat.seat_row))).sort();

  const getSeatsByRow = (row: string) => {
    return seats
      .map((seat) => {
        if (seat.seat_row === row) {
          if (selectedSeats.some((s) => s.id === seat.id)) {
            return { ...seat, status: "selected" };
          }
          return seat;
        }
        return null;
      })
      .filter(Boolean) as Seat[];
  };

  const getSeatColor = (seat: Seat) => {
    if (seat.status === "reserved")
      return "bg-gray-500 cursor-not-allowed opacity-50";
    if (seat.status === "selected") return "bg-cinema-primary";
    if (seat.status === "unavailable")
      return "bg-gray-500 cursor-not-allowed opacity-50";
    if (seat.status === "available") return "bg-green-700 cursor-pointer";
    return "bg-muted";
  };

  return (
    <div className="flex flex-col items-center py-4">
      <div className="mb-8 bg-black/50 w-4/5 h-2 rounded-lg mx-auto">
        <div className="text-center text-xs text-cinema-muted mt-1">SCREEN</div>
      </div>

      <div className="mb-8 max-w-3xl mx-auto overflow-x-auto">
        {rows.map((row) => (
          <div
            key={row}
            className="flex items-center justify-center gap-1 mb-2"
          >
            <div className="w-6 text-center font-medium">{row}</div>
            <div className="flex gap-1">
              {getSeatsByRow(row).map((seat) => (
                <button
                  key={seat.id}
                  className={`size-6 text-[10px] rounded-t-lg flex items-center justify-center ${getSeatColor(
                    seat
                  )} transition-colors ${
                    seat.status === "available"
                      ? "hover:bg-cinema-primary/70 cursor-pointer"
                      : ""
                  }`}
                  disabled={
                    seat.status === "reserved" || seat.status === "unavailable"
                  }
                  onClick={() => {
                    toggleSeat(seat);
                  }}
                >
                  {seat.seat_type.name.charAt(0).toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-8 mb-6">
        {seatStatuses.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`size-4 rounded-sm ${color}`}></div>
            <span className="text-sm">{label}</span>
          </div>
        ))}
      </div>

      {/* SeatType in this room */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {seatTypes.map((seatType, index) => (
          <div key={index} className="border p-2 px-4 rounded text-center">
            <div className="text-sm font-medium"> {seatType.name}</div>
            <div className="text-xs text-primary">
              {formatCurrency(seatType.extra_price + Number(showtime.price))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <p className="mb-4">
          Selected seats:{" "}
          {selectedSeats.length > 0
            ? selectedSeats.map((s) => `${s.seat_row}${s.seat_col}`).join(", ")
            : "None"}
        </p>
        <Button
          onClick={handleConfirm}
          disabled={selectedSeats.length === 0}
          className="min-w-[200px]"
        >
          Confirm ({selectedSeats.length})
          {selectedSeats.length > 0 &&
            ` - ${(
              selectedSeats.length * showtime.price
            ).toLocaleString()} VND`}
        </Button>
      </div>
    </div>
  );
};

export default SeatSelection;
