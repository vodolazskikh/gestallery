import React, { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";

const images = [
  {
    original: "https://picsum.photos/id/1018/1000/600/",
    thumbnail: "https://picsum.photos/id/1018/250/150/",
  },
  {
    original: "https://picsum.photos/id/1015/1000/600/",
    thumbnail: "https://picsum.photos/id/1015/250/150/",
  },
  {
    original: "https://picsum.photos/id/1019/1000/600/",
    thumbnail: "https://picsum.photos/id/1019/250/150/",
  },
];

const handpose = require("@tensorflow-models/handpose");

export const Video = () => {
  const webcamRef = React.useRef(null);
  const modelRef = React.useRef(null);
  const requestRef = React.useRef(null);
  const predictionsRef = React.useRef(null);
  const [ready, setReady] = React.useState(false);
  const photoRef = useRef(null);
  let mutablePosArr: number[] = [];

  const [rules, setRules] = useState<"hidden" | "start" | "mode">("start");

  const reactionOnSide = () => {
    const mid =
      mutablePosArr.reduce((prev, cur) => {
        return prev + cur;
      }, 0) / 20;
    if (mid > 180) {
      sideToPrev();
    } else {
      sideToNext();
    }
  };

  const capture = useCallback(async () => {
    if (webcamRef.current && modelRef.current) {
      const predictions = await (modelRef.current as any).estimateHands(
        (webcamRef.current as any).getCanvas(),
        true
      );

      const newPos = predictions[0]?.boundingBox?.topLeft[0] as
        | number
        | undefined;

      if (newPos) {
        mutablePosArr.push(newPos);
        console.log(newPos);
      } else {
        mutablePosArr = [];
      }

      if (mutablePosArr.length > 20) {
        reactionOnSide();
        mutablePosArr = [];
      }

      if (predictions) {
        predictionsRef.current = predictions;
      }

      if (!ready) {
        setReady(true);
      }
    }

    requestRef.current = requestAnimationFrame(capture) as any;
  }, [webcamRef, ready]);

  useEffect(() => {
    if (ready) {
      setRules("mode");
    }
  }, [ready]);

  useEffect(() => {
    const load = async () => {
      modelRef.current = await handpose.load();
    };

    load();
  }, [capture]);

  const sideToNext = () => {
    const currentIndex = (photoRef.current as any).getCurrentIndex();
    (photoRef.current as any).slideToIndex(currentIndex + 1);
  };

  const sideToPrev = () => {
    const currentIndex = (photoRef.current as any).getCurrentIndex();
    (photoRef.current as any).slideToIndex(currentIndex - 1);
  };

  return (
    <>
      {rules !== "hidden" && (
        <div
          style={{
            position: "absolute",
            zIndex: 1,
            top: 40,
            color: "#fff",
            background: "#000",
            padding: 10,
            borderRadius: 8,
          }}
        >
          <span
            style={{
              position: "absolute",
              right: 5,
              top: 5,
              fontSize: 20,
              cursor: "pointer",
            }}
            onClick={() => setRules("hidden")}
          >
            x
          </span>
          {rules === "mode" ? (
            <span>
              Включено управление жестами. <br />
              Поднимите правую или левую руку
            </span>
          ) : (
            <span>
              Нажите "Управлять жестами" <br />и дождитесь включения режима
            </span>
          )}
        </div>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: 20,
            flexDirection: "column",
          }}
        >
          <Webcam
            width="200"
            height="113"
            mirrored
            id="webcam"
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
          />
          <button
            style={{
              backgroundColor: "#fff",
              marginTop: 20,
            }}
            onClick={() => {
              requestRef.current = requestAnimationFrame(capture) as any;
            }}
          >
            Управлять жестами{" "}
            <span role="img" aria-label="Start">
              🖐
            </span>
          </button>
        </div>
      </div>

      <div style={{ height: 400 }}>
        <ImageGallery items={images} ref={photoRef} />
      </div>
    </>
  );
};
