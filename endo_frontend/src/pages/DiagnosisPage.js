import { useState , useEffect} from 'react';
import {useDropzone} from 'react-dropzone'
import addericon from '../image/file-add.svg'
import CarouselWithText from "../components/CarouselWithText";

function DiagnosisPage() {
  const [files, setFiles] = useState([]); // file from here return as [{preview: ..., name: ..., , Prop: ... , etc...}]

  const handleRemoveImage = () => {
    setFiles([]);
  }

  const {getRootProps, getInputProps, isDragActive, open} = useDropzone({
        accept: {'image/*':[]},
        noClick: true,
        onDrop: acceptedFiles => {
          console.log(acceptedFiles)
          setFiles(acceptedFiles.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        })));
    }})

   useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach(file => URL.revokeObjectURL(file.preview));
  }, [files]);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center">
        {files.length !== 0 ? (
          <div className="h-2/3 w-4/5 p-10 border-4 border-egypt-blue panel-sky flex flex-col justify-center items-center">
            <CarouselWithText
              cards={files.map((file, i) => ({
                id: i,
                src: file.preview,
              }))}
            />
            <button className="button-border mt-4" onClick={handleRemoveImage}>
              Delete
            </button>
          </div>
        ): (
          <div className="h-2/3 w-4/5">
            <div {...getRootProps()} 
            className={isDragActive? "dropzone bg-opacity-100 w-full h-full gap-6 flex flex-col items-center justify-center panel-sky border-4 border-dashed border-egypt-blue"
                                    :"dropzone bg-opacity-50 w-full h-full gap-6 flex flex-col items-center justify-center panel-sky border-4 border-dashed border-egypt-blue"
            }>
              <input {...getInputProps()} />
              {!isDragActive ?
                <>
                  <button type="button" onClick={open} className="button-enlarge w-3/4 h-1/6 shadow-xl text-3xl flex flex-row items-center justify-between"> 
                  {/*button in form can be submit or reset which reload page, add type to make sure
                  borrow the open function from dropzone lib*/}
                      <img src= {addericon} alt="add_icon" className="object-scale-down h-full"></img>
                      Select File From Folder
                      <img src= {addericon} alt="add_icon" className="object-scale-down h-full"></img>
                  </button>
                  <p className='text-opacity-50 text-egypt-blue'>Accepted Image Types: .JPG, .JPEG, .PNG, etc...</p>
                </> :
                  <p className='font-bold text-8xl text-white p-10'> Drop Files Here</p>}
                          
            </div>
          </div>
        )}
  </div>
  );
}

export default DiagnosisPage;