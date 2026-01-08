"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";

type User = {
  userId: string;
  avatarUrl? : string;
  x: number;
  y: number;
};

type DimensionType = {
  width: number;
  height: number;
};

interface MapType {
  dimensions: string;
  elements: PositionType[];
}

interface PositionType {
  id: number;
  element: ElementType;
  x: string;
  y: string;
}

interface ElementType {
  id: string;
  imageUrl: string; // use images for blocks
  height: string;
  width: string;
}

export default function Arena({ token, spaceId }: { token: string; spaceId: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const [others, setOthers] = useState<User[]>([]);
  const [myUser, setMyUser] = useState<User | null>(null);
  const myUserRef = useRef<User | null>(null);
  const [worldDimensions, setWorldDimensions] = useState<DimensionType>({ width: 2000, height: 2000 });
  const [scale, setScale] = useState<number>(2);
  const [map, setMap] = useState<MapType>();
  const [mapMatrix, setMapMatrix] = useState<number[][]>([]);
  const [elementImages, setElementImages] = useState<{ [key: number]: HTMLImageElement }>({});

  const gridsize = 50;

  // canvas size
  const [canvasSize, setCanvasSize] = useState({ width: 1000, height: 1000 });
  useEffect(() => {
    setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // fetch map
  useEffect(() => {
    async function mapData() {
      const res = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }) as any;

      if (res.data) {
        setMap(res.data);

        const [w, h] = res.data.dimensions.split("x");
        setWorldDimensions({ width: Number(w), height: Number(h) });
      }
    }
    mapData();
  }, [token, spaceId]);

  useEffect(() => {
    if (!map) return;

    const gridW = Math.floor(worldDimensions.width / gridsize);
    const gridH = Math.floor(worldDimensions.height / gridsize);
    const matrix = Array(gridH).fill(0).map(() => Array(gridW).fill(0));

    map.elements.forEach((el) => {
      for (let dx = 0; dx < Number(el.element.width); dx++) {
        for (let dy = 0; dy < Number(el.element.height); dy++) {
          const px = Number(el.x) + dx;
          const py = Number(el.y) + dy;
          if (matrix[py] && matrix[py][px] !== undefined) matrix[py][px] = 1;
        }
      }

      // load image
      const img = new Image();
      img.src = el.element.imageUrl;
      img.onload = () => {
        setElementImages((prev) => ({ ...prev, [el.id]: img }));
      };
    });

    setMapMatrix(matrix);
  }, [map, worldDimensions]);

  const [myAvatarImg, setMyAvatarImg] = useState<HTMLImageElement | null>(null);

// Preload avatar whenever it changes
useEffect(() => {
  if (!myUser?.avatarUrl) return;
  const img = new Image();
  img.src = myUser.avatarUrl;
  img.onload = () => setMyAvatarImg(img);
}, [myUser?.avatarUrl]);

  const [otherAvatarImg, setOthersAvatarImg] = useState<{[key : string]: HTMLImageElement}>({})

useEffect(() => {
  others.forEach((u) => {
    if (u.avatarUrl && !otherAvatarImg[u.userId]) {
      console.log(u.avatarUrl)
      const img = new Image();
      img.src = u.avatarUrl;
      img.onload = () => setOthersAvatarImg(prev => ({ ...prev, [u.userId]: img }));
    }
  });
}, [others, otherAvatarImg]);


  const gridWidth = Math.floor(worldDimensions.width / gridsize);
  const gridHeight = Math.floor(worldDimensions.height / gridsize);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // center avatar
    ctx.scale(scale, scale);
    ctx.translate(
      canvas.width / (2 * scale) - (myUser?.x ?? 0),
      canvas.height / (2 * scale) - (myUser?.y ?? 0)
    );

    // background
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, worldDimensions.width, worldDimensions.height);

    // draw map blocks with images
    map?.elements.forEach((el) => {
      const img = elementImages[el.id];
      if (img && img.complete) {
        ctx.drawImage(
          img,
          Number(el.x) * gridsize,
          Number(el.y) * gridsize,
          Number(el.element.width) * gridsize,
          Number(el.element.height) * gridsize
        );
      } else {
        // fallback if image not loaded
        ctx.fillStyle = "gray";
        ctx.fillRect(
          Number(el.x) * gridsize,
          Number(el.y) * gridsize,
          Number(el.element.width) * gridsize,
          Number(el.element.height) * gridsize
        );
      }
    });

    // draw others
    ctx.fillStyle = "blue";
    others.forEach((u) =>{
      const img = otherAvatarImg[u.userId];
      console.log(img);
      console.log(otherAvatarImg);
      if(img){
        ctx.drawImage(
          img,
          u.x - gridsize / 2,
          u.y - gridsize / 2,
          gridsize,
          gridsize
        )
      }else {
        ctx.fillStyle='blue';
        ctx.fillRect(u.x - gridsize / 2, u.y - gridsize / 2, gridsize, gridsize);
      }
    });

    // draw me
  // draw me
  if (myUser && myAvatarImg?.complete) {
    ctx.drawImage(
      myAvatarImg,
      myUser.x - gridsize / 2, // center the avatar
      myUser.y - gridsize / 2,
      gridsize,
      gridsize
    );
  } else if (myUser) {
    // fallback rectangle
    ctx.fillStyle = "red";
    ctx.fillRect(myUser.x - gridsize / 2, myUser.y - gridsize / 2, gridsize, gridsize);
  }
})

  // update myUser ref
  useEffect(() => {
    myUserRef.current = myUser;
  }, [myUser]);

  // movement handler
  const movementHandler = (direction: "up" | "down" | "left" | "right") => {
    if (!wsRef.current || !myUserRef.current) return;

    const { x, y, userId } = myUserRef.current;
    console.log(x)
    console.log(y)
    const gridX = Math.floor(x / gridsize);
    const gridY = Math.floor(y / gridsize);

    let newGridX = gridX;
    let newGridY = gridY;


    console.log(newGridX)
    console.log(newGridY)
    const speed = 1;
    switch (direction) {
      case "up":
        newGridY -= speed;
        break;
      case "down":
        newGridY += speed;
        break;
      case "left":
        newGridX -= speed;
        break;
      case "right":
        newGridX += speed;
        break;
    }

    // bounds check
    if (
      newGridX < 0 ||
      newGridY < 0 ||
      newGridY >= mapMatrix.length ||
      newGridX >= mapMatrix[0].length
    )
      return;

    if (mapMatrix[newGridY][newGridX] === 1) return; // blocked

    const newX = newGridX * gridsize + gridsize / 2;
    const newY = newGridY * gridsize + gridsize / 2;

    setMyUser((prev) => prev && { ...prev, x: newX, y: newY });

    wsRef.current.send(JSON.stringify({ type: "move", payload: { x: newX, y: newY, userId } }));
  };

  // WebSocket
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;

    ws.onopen = () => ws.send(JSON.stringify({ type: "join", payload: { token, spaceId } }));

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      console.log(msg)
      switch (msg.type) {
        case "space-joined":
          const spawn = msg.payload.spawn;
          setMyUser({ userId: msg.payload.userId, x: spawn.x, y: spawn.y , avatarUrl : spawn.avatarUrl});
          setOthers(msg.payload.users);
          break;
        case "user-joined":
          setOthers((prev) => [...prev, { userId: msg.payload.userId, x: msg.payload.x, y: msg.payload.y , avatarUrl : msg.payload.avatarUrl}]);
          break;
        case "movement":
          if (myUserRef.current?.userId === msg.payload.userId)
            setMyUser({ userId: msg.payload.userId, x: msg.payload.x, y: msg.payload.y});
          else
            setOthers((prev) =>
              prev.map((u) => (u.userId === msg.payload.userId ? { ...u, x: msg.payload.x, y: msg.payload.y } : u))
            );
          break;
        case "user-left":
          setOthers((prev) => prev.filter((u) => u.userId !== msg.payload.userId));
          setOthersAvatarImg((prev) => {
            const newImgs = { ...prev };
            delete newImgs[msg.payload.userId]; // remove the avatar image
            return newImgs;
          });
          break;
      }
    };

    ws.onclose = () => console.log("WebSocket disconnected");
    return () => ws.close();
  }, [token, spaceId]);

  // redraw
useEffect(() => {
  drawCanvas();
}, [others, myUser, drawCanvas, canvasSize, scale, elementImages]);

  // key movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") movementHandler("up");
      if (e.key === "ArrowDown") movementHandler("down");
      if (e.key === "ArrowLeft") movementHandler("left");
      if (e.key === "ArrowRight") movementHandler("right");
    };
    console.log(handleKeyDown)
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // scale handlers
  const increaseScaleHandler = () => setScale((p) => p + 1);
  const decreaseScaleHandler = () => setScale((p) => Math.max(1, p - 1));
  const resetScaleHandler = () => setScale(2);

  return (
    <div className="flex justify-center items-center w-screen">
      <div className="w-[70%]">
        <canvas ref={canvasRef} className="w-full h-full border bg-black" />
      </div>
      <div className="w-[30%]">
        spaceId: {spaceId}
        <div className="bg-gray-400 flex flex-col justify-center w-[40%]">
          <button onClick={increaseScaleHandler}>+</button>
          <button onClick={decreaseScaleHandler}>-</button>
          <button onClick={resetScaleHandler}>reset scale</button>
        </div>
      </div>
    </div>
  );
}
