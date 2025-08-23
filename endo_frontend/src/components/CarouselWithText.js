import { useState} from "react";

function DirectBt({arrow, onClickTrigger}){
    return(
        <button onClick={onClickTrigger} className="h-1/3 w-1/10 m-4 text-white font-bold text-xl bg-black rounded-2xl p-5">
            {arrow}
        </button>
    )
}

function Card({id, image}){   
    return (
    <div className="w-full h-full flex flex-col items-center overflow-hidden gap-4">
        <img
            src={image}
            alt={id}
            className="object-cover"
        />
    </div>
    )
}

function CarouselWithText( {cards} ) {
    const [index, setIndex] = useState(0)

    const onClkLeft = () =>{
        setIndex(index > 0 ? index - 1 : index)
        
    }
    const onClkRight = () =>{
        setIndex(index < cards.length - 1 ? index + 1 : index)
    }

    return (
        <div className="w-full h-full flex flex-col justify-center gap-4">
            <div className="h-80 flex flex-row gap-3 items-center ">
                <DirectBt
                    arrow = "<"
                    onClickTrigger = {onClkLeft}
                />
                <Card
                    id={cards[index].id}
                    image={cards[index].src}
                />
                <DirectBt
                    arrow = ">"
                    onClickTrigger = {onClkRight}   
                />
            </div>
            <p className="text-center text-egypt-blue text-xl justify-self-end">{cards[index].text}</p>
        </div>
    );
}

export default CarouselWithText;