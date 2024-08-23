"use client";
import { db } from "@/configs";
import { events } from "@/configs/schema";
import { eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";

function Admin() {
  const [files, setFiles] = useState([]);
  const [name, setname] = useState();
  const [desc, setdesc] = useState();
  const [uploadedFileNames, setUploadedFileNames] = useState([]); // State to store uploaded file names

  const onSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    files.forEach((file) => data.append("files", file));

    let result = await fetch("api/upload", {
      method: "POST",
      body: data,
    });
    result = await result.json();
    console.log("Upload Result:", result);

    if (result.success) {
      alert("Images uploaded");
      // Save the uploaded file names in state
      const fileNames = files.map((file) => file.name);
      console.log("Uploaded File Names:", fileNames); // Debugging log
      setUploadedFileNames(fileNames);

      // Call uploadToDb after the state has been updated
      uploadToDb(fileNames);
    }
  };

  const uploadToDb = async (fileNames) => {
    const result = await db.insert(events).values({
      eventName: name,
      eventDesc: desc,
      images: fileNames, // Use the file names passed as an argument
    });
  };

  const [eventList, seteventList] = useState();

  useEffect(() => {
    getEventList();
  }, []);

  const getEventList = async () => {
    const result = await db.select().from(events);
    seteventList(result);
    console.log(result);
  };

  const onDeleteEvent = async () => {
    const result = await db
      .delete(events)
      .where(
          eq(events.id, eventList.id),
      );
  };


  return (
    <div>
    <div className="text-white mx-auto w-[60%] border p-10">
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <label>Event Name</label>
        <input
          type="text"
          name="eventName"
          onChange={(e) => setname(e.target.value)}
          className="text-black"
        />
        <label>Event Description</label>
        <textarea
          name="evenDesc"
          onChange={(e) => setdesc(e.target.value)}
          className="text-black"
        />
        <input
          type="file"
          name="files"
          multiple
          onChange={(e) => {
            const selectedFiles = Array.from(e.target.files);
            console.log("Selected Files:", selectedFiles); // Debugging log
            setFiles(selectedFiles);
          }}
        />
        <button
          type="submit"
          className="text-white bg-secondary p-5"
        >
          Upload
        </button>
      </form>
      </div>

      <div className="mt-20 text-white flex flex-col gap-10">
      {eventList?.map((item, index) => (
        <div key={index} className="border flex justify-between p-10">
          <div>
          <p>
            {item.eventName}
          </p>
            {item.images.map((image, i) => (
              <div key={i}>
                {image}
              </div>
            ))}
          <p>
            {item.eventDesc}
          </p>
          </div>
          <div>
            <p onClick={async ()=>{await onDeleteEvent();}}>Delete</p>
          </div>
        </div>
      ))}
    </div>
    </div>
  );
}

export default Admin;