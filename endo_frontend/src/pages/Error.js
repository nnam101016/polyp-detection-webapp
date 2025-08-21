function Error(){
    return(
        <div className="flex flex-col items-center justify-center min-h-screen max-w-screen">
            <div className="flex flex-col panel-yellow shadow-md gap-4 p-12">
                <h1 className="text-2xl font-bold text-center text-white"> 404 - Page Not Found</h1>

                <p className="text-center text-lg text-white">
                   The link you are looking for does not exist <br/>
                   Please Go Back.
                </p>
                {/* Add more content as needed */}
            </div>
        </div>
    )
}

export default Error;