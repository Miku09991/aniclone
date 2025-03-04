
interface VideoTitleProps {
  title: string;
  episodeNumber?: number;
}

const VideoTitle = ({ title, episodeNumber }: VideoTitleProps) => {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-white text-lg font-medium truncate pr-4">
        {title} {episodeNumber ? `- Эпизод ${episodeNumber}` : ''}
      </h3>
    </div>
  );
};

export default VideoTitle;
