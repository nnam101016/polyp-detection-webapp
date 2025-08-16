const items = [
    {
        img: "https://c7.alamy.com/comp/D3HJNR/colon-endoscopy-result-D3HJNR.jpg",
        caption: "Low Mode"
    },
    {
        img: "https://c7.alamy.com/comp/CT58JE/stomach-endoscopy-result-CT58JE.jpg",
        caption: "High Mode"
    },
    {
        img: "https://media.springernature.com/full/springer-static/image/art%3A10.1155%2F2010%2F814319/MediaObjects/13640_2010_Article_338_Fig2_HTML.jpg?as=webp",
        caption: "Segmentation Mode"
    }
]

function CarouselWithText() {
    return (
        <div className="w-full py-8">
            <div className="flex flex-row gap-8 justify-center items-center">
                {items.map((item, index) => (
                    <div key={index} className="flex flex-col items-center">
                        <img
                            
                            src={item.img}
                            alt={item.caption}
                            className="h-64 w-64 object-cover rounded-lg shadow-lg"
                        />
                        <p className="mt-4 text-center text-lg text-egypt-blue">{item.caption}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CarouselWithText;