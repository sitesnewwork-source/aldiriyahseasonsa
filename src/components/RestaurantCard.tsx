import { motion } from "framer-motion";

interface RestaurantCardProps {
  name: string;
  cuisine: string;
  description: string;
  image: string;
  hours: string;
  index: number;
}

const RestaurantCard = ({ name, cuisine, description, image, hours, index }: RestaurantCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group cursor-pointer"
    >
      {/* Image container */}
      <div className="relative overflow-hidden rounded-sm aspect-[4/3] mb-4">
        <img
          src={image}
          alt={name}
          loading="lazy"
          width={800}
          height={600}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-earth/0 group-hover:bg-earth/30 transition-all duration-500" />

        {/* Cuisine badge */}
        <div className="absolute top-4 right-4 bg-earth/80 backdrop-blur-sm px-3 py-1 rounded-sm">
          <span className="text-gold text-xs font-medium">{cuisine}</span>
        </div>

        {/* Hover overlay with CTA */}
        <div className="absolute inset-0 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-4">
          <span className="w-full text-center bg-accent text-accent-foreground py-2.5 rounded-sm text-sm font-bold">
            احجز الآن
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2">
        <h3 className="font-display text-xl font-bold text-foreground group-hover:text-gold-dark transition-colors">
          {name}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
          {description}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-1 h-1 rounded-full bg-gold" />
          <span>{hours}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default RestaurantCard;
