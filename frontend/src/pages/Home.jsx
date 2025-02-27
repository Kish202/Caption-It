import React, { useState } from "react";
import ReactPlayer from "react-player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { PlusCircle, X, Trash2, Download } from "lucide-react";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

const HomePage = () => {
  // State for video URL and display
  const [videoUrl, setVideoUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Separate states for normal and timestamped captions
  const [normalCaptions, setNormalCaptions] = useState("");
  const [timeStampedCaptions, setTimeStampedCaptions] = useState([
    { startTime: 0, endTime: 0, text: "" },
  ]);

  const [activeCaptionTab, setActiveCaptionTab] = useState("normal");
  const [displayedCaption, setDisplayedCaption] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);


  // Form for video URL
  const videoUrlForm = useForm({
    defaultValues: {
      videoUrl: "",
    },
  });

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    const input = e.target.elements.videoUrl.value;
    if (input && ReactPlayer.canPlay(input)) {
      setVideoUrl(input);
      setShowUrlInput(false);
    } else {
      alert("Please enter a valid video URL");
    }
  };

  const addTimeStampedCaption = () => {
    setTimeStampedCaptions([
      ...timeStampedCaptions,
      { startTime: 0, endTime: 0, text: "" },
    ]);
  };

  const removeTimeStampedCaption = (index) => {
    const newCaptions = [...timeStampedCaptions];
    newCaptions.splice(index, 1);
    setTimeStampedCaptions(newCaptions);
  };

  const updateTimeStampedCaption = (index, field, value) => {
    const newCaptions = [...timeStampedCaptions];
    newCaptions[index][field] = value;
    setTimeStampedCaptions(newCaptions);
  };

  const applyNormalCaptions = () => {
    setDisplayedCaption(normalCaptions);
    
// check if the caption is empty
    if (normalCaptions.trim() === "") {
      toast.error("Caption cannot be empty");
    }
    
    else{
      toast.success("Captions Set Successfully")
    }


  };

  const applyTimestampedCaptions = () => {
    setDisplayedCaption("");
  
  // Check if any timestamped caption has text
  const hasValidCaptions = timeStampedCaptions.some(caption => 
    caption.text.trim() !== "" && caption.startTime >= 0 && caption.endTime > caption.startTime
  );

  if (!hasValidCaptions) {
    toast.error("Please add valid timestamped captions with text and proper time ranges");
    return;
  }

  toast.success("Captions Set Successfully");
  };

  const removeNormalCaptions = () => {
    setCaptions("");

    if (activeCaptionTab === "normal") {
      setDisplayedCaption("");
    }
  };

  const removeAllTimestampedCaptions = () => {
    setTimeStampedCaptions([{ startTime: 0, endTime: 0, text: "" }]);


  };

  const handleProgress = (progress) => {


    if (activeCaptionTab === "timestamped") {
      const activeCaption = timeStampedCaptions.find(
        (caption) =>
          progress.playedSeconds >= caption.startTime &&
          progress.playedSeconds <= caption.endTime &&
          caption.text.trim() !== ""
      );

      setDisplayedCaption(activeCaption ? activeCaption.text : "");
    }
  };

  const formatSrtTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 1000);

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")},${String(milliseconds).padStart(
      3,
      "0"
    )}`;
  };

  const handleDownloadVideo = () => {
    try {
      if (!videoUrl) {
        alert("Please add a video first");
        return;
      }

      const isStreamingPlatformVideo =
        videoUrl.includes("youtube.com") ||
        videoUrl.includes("youtu.be") ||
        videoUrl.includes("vimeo.com") ||
        videoUrl.includes("dailymotion.com");

      if (isStreamingPlatformVideo) {
        alert(
          "Direct downloads from streaming platforms like YouTube aren't supported. Please use a dedicated video downloader service."
        );

        if (activeCaptionTab === "normal" && normalCaptions.trim() !== "") {
          downloadNormalCaptions();
        } else if (
          activeCaptionTab === "timestamped" &&
          timeStampedCaptions.some((caption) => caption.text.trim() !== "")
        ) {
          downloadTimestampedCaptions();
        }
        return;
      }

      {
        const hasCaptions =
          activeCaptionTab === "normal"
            ? normalCaptions.trim() !== ""
            : timeStampedCaptions.some((caption) => caption.text.trim() !== "");

        let alertMessage = "This will download the original video";
        if (hasCaptions) {
          alertMessage +=
            " and your captions as a separate file that can be loaded in most video players";
        }
        alertMessage += ".\n\nWould you like to proceed?";

        const confirmDownload = window.confirm(alertMessage);

        if (!confirmDownload) {
          return;
        }
      }

      fetch(videoUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.blob();
        })
        .then((blob) => {
          const videoObjectUrl = URL.createObjectURL(blob);
          const videoLink = document.createElement("a");
          videoLink.href = videoObjectUrl;
          videoLink.download = videoUrl.split("/").pop() || "video.mp4";
          videoLink.style.display = "none";
          document.body.appendChild(videoLink);
          videoLink.click();
          document.body.removeChild(videoLink);

          setTimeout(() => {
            URL.revokeObjectURL(videoObjectUrl);
          }, 100);

          if (activeCaptionTab === "normal" && normalCaptions.trim() !== "") {
            downloadNormalCaptions();
          } else if (
            activeCaptionTab === "timestamped" &&
            timeStampedCaptions.some((caption) => caption.text.trim() !== "")
          ) {
            downloadTimestampedCaptions();
          }
        })
        .catch((error) => {
          console.error("Error downloading video:", error);
          alert(
            "There was an error downloading the video. This might be due to CORS restrictions or because the video is from a streaming platform that doesn't allow direct downloads."
          );
        });
    } catch (error) {
      console.error("Error in download function:", error);
      alert("There was an error with the download. Please try again.");
    }
  };

  const downloadNormalCaptions = () => {
    // Create a blob with the captions text
    const captionsBlob = new Blob([normalCaptions], { type: "text/plain" });
    const captionsUrl = URL.createObjectURL(captionsBlob);

    // Create a download link for the captions
    const captionsLink = document.createElement("a");
    captionsLink.href = captionsUrl;
    captionsLink.download = "video_captions.txt";
    captionsLink.style.display = "none";
    document.body.appendChild(captionsLink);
    captionsLink.click();
    document.body.removeChild(captionsLink);

    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(captionsUrl);
    }, 100);
  };

  // Helper function to download timestamped captions
  const downloadTimestampedCaptions = () => {
    // Format timestamped captions as SRT
    let srtContent = "";
    timeStampedCaptions.forEach((caption, index) => {
      if (caption.text.trim() !== "") {
        // Format: index, timestamp range, text, blank line
        const startTime = formatSrtTime(caption.startTime);
        const endTime = formatSrtTime(caption.endTime);

        srtContent += `${index + 1}\n`;
        srtContent += `${startTime} --> ${endTime}\n`;
        srtContent += `${caption.text}\n\n`;
      }
    });

    // Create a blob with the SRT content
    const srtBlob = new Blob([srtContent], { type: "text/plain" });
    const srtUrl = URL.createObjectURL(srtBlob);

    // Create a download link for the SRT file
    const srtLink = document.createElement("a");
    srtLink.href = srtUrl;
    srtLink.download = "video_captions.srt";
    srtLink.style.display = "none";
    document.body.appendChild(srtLink);
    srtLink.click();
    document.body.removeChild(srtLink);

    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(srtUrl);
    }, 100);
  };

  const handleRemoveVideo = () => {
    setVideoUrl("");
    setShowUrlInput(true);
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-full pl-4 pr-4 gap-4 ">
      {/* Left div - Captions Input */}

      <div className="w-full flex lg:w-1/2 justify-center flex-col gap-4 ml-2 order-2 lg:order-1">
        <div className=" max-h-[90%] overflow-auto">
          <Tabs
            defaultValue="normal"
            onValueChange={setActiveCaptionTab}
            className="flex justify-center flex-col "
          >
            <TabsList className="mx-auto">
              <TabsTrigger value="normal">Normal Captions</TabsTrigger>
              <TabsTrigger value="timestamped">
                TimeStamped Captions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="normal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Enter Captions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Enter your captions here..."
                    className="min-h-32"
                    value={normalCaptions}
                    onChange={(e) => setNormalCaptions(e.target.value)}
                  />

                  <div className="flex justify-center mt-4 gap-2">
                    <Button className="" onClick={applyNormalCaptions}>
                      Apply Captions
                    </Button>

                    <Button onClick={removeNormalCaptions}>
                      Remove Caption
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timestamped" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>TimeStamped Captions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {timeStampedCaptions.map((caption, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-2 pb-4 border-b"
                    >
                      <div className="flex gap-2 items-center">
                        <div className="flex-1">
                          <Label>Start Time (seconds)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            value={caption.startTime}
                            onChange={(e) =>
                              updateTimeStampedCaption(
                                index,
                                "startTime",
                                parseFloat(e.target.value)
                              )
                            }
                          />
                        </div>
                        <div className="flex-1">
                          <Label>End Time (seconds)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            value={caption.endTime}
                            onChange={(e) =>
                              updateTimeStampedCaption(
                                index,
                                "endTime",
                                parseFloat(e.target.value)
                              )
                            }
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="mt-6"
                          onClick={() => removeTimeStampedCaption(index)}
                          disabled={timeStampedCaptions.length === 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <Label>Caption Text</Label>
                        <Textarea
                          value={caption.text}
                          onChange={(e) =>
                            updateTimeStampedCaption(
                              index,
                              "text",
                              e.target.value
                            )
                          }
                          placeholder="Enter caption text..."
                        />
                      </div>
                    </div>
                  ))}

                  <div className="flex flex-col md:flex-row gap-2 justify-center items-center">
                    <div className="flex items-center gap-2">
                      <Button
                        className=" w-full"
                        onClick={applyTimestampedCaptions}
                      >
                        SET Captions
                      </Button>
                      <Button
                     
                        className="w-full flex items-center gap-2"
                        onClick={addTimeStampedCaption}
                      >
                        <PlusCircle className="h-4 w-4" /> Add Caption
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button onClick={removeAllTimestampedCaptions}>
                        Remove Caption
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right div - Video Player */}

      <div className="w-full lg:w-1/2 flex justify-center flex-col gap-4 order-1 lg:order-2">
        <Card
          className="w-full h-60% flex flex-col"
          style={{
            aspectRatio: "16/9",
            maxWidth: "85%",
            margin: "0 auto",
            transform: "perspective(1000px) rotateY(-20deg)",
            borderRadius: "12px",
            boxShadow:
              "0 0 20px rgba(0, 100, 255, 0.2), 0 0 40px rgba(0, 50, 255, 0.1)",
            border: "1px solid rgba(100, 150, 255, 0.2)",
            background: "linear-gradient(to right, #c2ecf3, #e5e7f8)",

            position: "relative",
          }}
        >
          <CardContent className="flex-1 p-0 flex flex-col h-full w-full relative rounded-xl">
            {videoUrl ? (
              <div
                className="player-wrapper"
                style={{
                  position: "relative",
                  paddingTop: 0,
                  height: "100%",
                  width: "100%",
                  margin: 0,
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                <ReactPlayer
                  url={videoUrl}
                  width="100%"
                  height="100%"
                  controls
                  playing={isPlaying}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onProgress={handleProgress}
                />
                {displayedCaption && (
                  <div className="absolute bottom-12 left-0 right-0 bg-black bg-opacity-70 text-white p-2 text-center">
                    {displayedCaption}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 w-full">
                {showUrlInput ? (
                  <Form {...videoUrlForm}>
                    <form
                      onSubmit={handleUrlSubmit}
                      className="w-full space-y-4"
                    >
                      <FormField
                        control={videoUrlForm.control}
                        name="videoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Video URL</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                name="videoUrl"
                                placeholder="Enter video URL..."
                                required
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          className=" text-blue-950"
                          style={{
                            boxShadow: "0 0 10px rgba(52, 115, 240, 0.58)",
                            border: "0.5px solid rgba(89, 180, 236, 0.3)",
                            background:
                              "linear-gradient(to right, #c2ecf3, #e5e7f8)",
                          }}
                        >
                          Add Video
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowUrlInput(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <Button
                    onClick={() => setShowUrlInput(true)}
                    className="flex items-center gap-2 text-blue-950 hover:brightness-105"
                    style={{
                      boxShadow: "0 0 10px rgba(52, 115, 240, 0.58)",
                      border: "0.5px solid rgba(89, 180, 236, 0.3)",
                      background: "linear-gradient(to right, #c2ecf3, #e5e7f8)",
                    }}
                  >
                    <PlusCircle className="h-5 w-5" /> Add Video
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Remove Video Button */}
        {videoUrl && (
          <div className="flex gap-2 mx-auto" style={{ maxWidth: "85%" }}>
            {/* Remove Video Button */}
            <Button
              variant="outline"
              onClick={handleRemoveVideo}
              className="flex items-center gap-2 flex-1 hover:brightness-105"
              style={{
                borderRadius: "24px",
                boxShadow: "0 0 10px rgba(52, 115, 240, 0.58)",
                border: "0.5px solid rgba(89, 180, 236, 0.3)",
                background: "linear-gradient(to right, #c2ecf3, #e5e7f8)",
              }}
            >
              <Trash2 className="h-4 w-4" /> Remove Video
            </Button>

            {/* Download Video Button */}
            <Button
              variant="outline"
              onClick={handleDownloadVideo}
              className="flex items-center gap-2 flex-1 hover:brightness-105"
              style={{
                borderRadius: "24px",
                boxShadow: "0 0 10px rgba(52, 115, 240, 0.58)",
                border: "0.5px solid rgba(89, 180, 236, 0.3)",
                background: "linear-gradient(to right, #c2ecf3, #e5e7f8)",
              }}
            >
              <Download className="h-4 w-4" /> Download Video
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

                                                             export default HomePage;
