import { motion } from "framer-motion";
import introImg from "@/assets/intro-people.jpg";
import foodSpread from "@/assets/food-spread.jpg";
import foodDessert from "@/assets/food-dessert.jpg";
import foodCoffee from "@/assets/food-coffee.jpg";
import foodSushi from "@/assets/food-sushi.jpg";
import foodPasta from "@/assets/food-pasta.jpg";

const galleryImages = [foodSpread, foodDessert, foodCoffee, foodSushi, foodPasta];

const IntroSection = () => {
  return (
    <section className="py-20 md:py-32 bg-background relative overflow-hidden">
      {/* Decorative triangles (like Diriyah site) */}
      <div className="absolute top-0 right-0 w-40 h-40 opacity-5">
        <div className="w-0 h-0 border-l-[160px] border-l-transparent border-t-[160px] border-t-sand-dark" />
      </div>
      <div className="absolute top-20 right-32 w-32 h-32 opacity-5">
        <div className="w-0 h-0 border-l-[130px] border-l-transparent border-t-[130px] border-t-sand-dark" />
      </div>

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <img
              src={introImg}
              alt="استكشف مطاعم الموسم"
              loading="lazy"
              width={700}
              height={800}
              className="w-full h-auto rounded-sm"
            />
          </motion.div>

          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-right"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              استكشف مطاعم<br />الموسم
            </h2>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-lg mr-auto lg:mr-0">
              تجمع مطاعم الموسم بين النكهات العالمية العصرية وأصالة المأكولات السعودية التقليدية،
              لتقدّم تجارب طهي فريدة تأسر الحواس وتروي حكايات من التراث والابتكار.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Image strip gallery (like Diriyah site) */}
      <div className="mt-16 md:mt-24 overflow-hidden">
        <div className="flex gap-3 md:gap-4 animate-none">
          {galleryImages.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex-shrink-0 w-[200px] md:w-[280px] h-[140px] md:h-[180px] overflow-hidden rounded-sm"
            >
              <img
                src={img}
                alt=""
                loading="lazy"
                width={800}
                height={520}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IntroSection;
