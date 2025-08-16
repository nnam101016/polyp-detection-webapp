import { useState } from 'react';
import {useDropzone} from 'react-dropzone'
import addericon from '../image/file-add.svg'

function DiagnosisPage() {
  const [image, setImage] = useState(null);

  const handleRemoveImage = () => {
    setImage(null);
  }

  const {getRootProps, getInputProps, isDragActive, open} = useDropzone({
        accept: {
            'image/jpeg': ['.jpeg', '.jpg'],
            'image/png': ['.png'],
            // only image types allowed
        },
        noClick: true,
        onDrop: (acceptedFiles, rejectedFiles) =>{
            console.log(acceptedFiles)
            console.log(rejectedFiles)
        }
    })

  return (
    <div className="flex flex-col items-center h-screen justify-center">
        {image ? (
          <div className="h-1/2 w-2/3 p-4">
            <img src={image} alt="Preview" className="object-contain"/>
            <button className="button-enlarge m-4" onClick={handleRemoveImage}>
                Delete
            </button>
          </div>
        ): (
          <div className="h-2/3 w-4/5 m-10">
            <div {...getRootProps()} 
            className={isDragActive? "bg-opacity-100 w-full h-full gap-6 flex flex-col items-center justify-center panel-sky border-4 border-dashed border-egypt-blue"
                                    :"bg-opacity-50 w-full h-full gap-6 flex flex-col items-center justify-center panel-sky border-4 border-dashed border-egypt-blue"
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