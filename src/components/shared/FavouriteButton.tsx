"use client";

import { useState } from "react";
import { toggleFavourite } from "@/actions/friend.actions";
import { FaStar } from "react-icons/fa";

export default function FavouriteButton({
  id,
  isFavourite,
}: {
  id: string;
  isFavourite: boolean;
}) {
  const [fav, setFav] = useState(isFavourite);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    setFav(!fav);
    await toggleFavourite(id, !fav);
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`btn ${
        fav
          ? "bg-yellow-400 border-yellow-400 text-white hover:bg-white hover:text-yellow-500 hover:border-yellow-400"
          : "btn-warning"
      }`}
    >
      <FaStar size={13} />
      <span>{fav ? "Favourited" : "Favourite"}</span>
    </button>
  );
}
