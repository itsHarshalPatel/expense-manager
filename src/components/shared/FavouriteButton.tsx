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
      className={`common-btn ${
        fav
          ? "bg-yellow-400 border-yellow-400 hover:bg-white hover:text-yellow-400"
          : "bg-white border-brand-border text-brand-black hover:bg-yellow-400 hover:border-yellow-400"
      }`}
    >
      <FaStar size={14} />
      <span>{fav ? "Favourited" : "Add to Favourites"}</span>
    </button>
  );
}
