import bg from "../logo.svg";

function Container(){
    return (
        <div className="h-screen">
            <img src={bg} alt="Placeholder" className="mx-auto my-4"/>
            <p className="flex-grow text-center text-gray-700">
                This is a container component. It can be used to wrap other components or content.
            </p>
        </div>
    )
}  

export default Container;