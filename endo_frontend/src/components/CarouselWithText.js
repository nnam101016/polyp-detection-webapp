import { useState } from "react";

function DirectBt({ arrow, onClickTrigger }) {
  return (
    <button
      onClick={onClickTrigger}
      className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/80 text-white text-xl grid place-items-center hover:bg-black"
      aria-label={arrow === "<" ? "Previous" : "Next"}
    >
      {arrow}
    </button>
  );
}

function Card({ id, image }) {
  return (
    // fixed, responsive stage for the image
    <div className="flex-1 h-[360px] md:h-[420px] overflow-hidden rounded-xl bg-white">
      <img
        src={image}
        alt={id}
        className="w-full h-full object-contain"  // fit inside without cropping
      />
    </div>
  );
}

export default function CarouselWithText({ cards }) {
  const [index, setIndex] = useState(0);

  const onClkLeft = () => setIndex((i) => (i > 0 ? i - 1 : i));
  const onClkRight = () => setIndex((i) => (i < cards.length - 1 ? i + 1 : i));

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <DirectBt arrow="<" onClickTrigger={onClkLeft} />
        <Card id={cards[index].id} image={cards[index].src} />
        <DirectBt arrow=">" onClickTrigger={onClkRight} />
      </div>

      <p className="mt-3 text-center text-egypt-blue text-xl">
        {cards[index].text}
      </p>
    </div>
  );
}
