-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 07-04-2024 a las 15:23:39
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `chat`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `grupos`
--

CREATE TABLE `grupos` (
  `id_grupo` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `groupname` varchar(25) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `grupos`
--

INSERT INTO `grupos` (`id_grupo`, `id_usuario`, `groupname`) VALUES
(1, 1, 'setab'),
(6, 1, 'channelName'),
(7, 1, 'channelName'),
(8, 1, 'gg'),
(9, 1, 'ezzi'),
(10, 1, 'comilona'),
(11, 2, 'gg'),
(12, 1, 'xd'),
(13, 1, 'xd2'),
(14, 2, 'a'),
(15, 1, ':v'),
(16, 1, 'kfc'),
(17, 1, 'kfc'),
(18, 1, 'kfc'),
(19, 1, 'wwe'),
(20, 1, 'wwe2');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mensajes`
--

CREATE TABLE `mensajes` (
  `id_mensaje` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_grupo` int(11) NOT NULL,
  `mensaje` text NOT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `mensajes`
--

INSERT INTO `mensajes` (`id_mensaje`, `id_usuario`, `id_grupo`, `mensaje`, `fecha_creacion`) VALUES
(1, 1, 1, 'asdasdasd', '2024-04-04 15:28:25'),
(2, 1, 1, 'Hola mundo', '2024-04-04 15:28:25'),
(3, 1, 1, 'Que tal !!! Como esta mi gente!!! Echale candela arriba Venezuela!!!', '2024-04-04 15:30:17'),
(4, 1, 1, 'El negocio de las series en streaming puede llegar a ser muy cruel, pues los resultados siempre son ', '2024-04-04 15:32:32'),
(5, 1, 1, 'En el principio, cuando Dios creó los cielos y la tierra,  2 todo era confusión y no había nada en la tierra. Las tinieblas cubrían los abismos mientras el Espíritu de Dios aleteaba sobre la superficie de las Aguas.  3 Dijo Dios: \'Haya luz\', y hubo luz.  4 Dios vio que la luz era buena, y separó la luz de las tinieblas.  5 Dios llamó a la luz \'Día\' y a las tinieblas \'Noche\'. Atardeció y amaneció: fue el día Primero.  6 Dijo Dios: \'Haya una bóveda en medio de las aguas, para que separe unas aguas de las otras.\'  7 Hizo Dios entonces como una bóveda y separó unas aguas de las otras: las que estaban por encima del firmamento, de las que estaban por debajo de él. Y así sucedió.  8 Dios llamó a esta bóveda \'Cielo\'. Y atardeció y amaneció: fue el día Segundo.  9 Dijo Dios: \'Júntense las aguas de debajo de los cielos en un solo depósito, y aparezca el suelo seco. Y así fue.  10 Dios llamó al suelo seco \'Tierra\' y al depósito de las Aguas \'Mares\'. Y vio Dios que esto era bueno.  11 Dijo Dios: \'Produzca la tierra hortalizas, plantas que den semilla, y árboles frutales que por toda la tierra den fruto con su semilla dentro, cada uno según su especie. Y así fue.  12 La tierra produjo hortalizas, plantas que dan semillas y árboles frutales que dan fruto con su semilla dentro, cada uno según su especie. Dios vio que esto era bueno.  13 Y atardeció y amaneció: fue el día Tercero.  14 \' Dijo Dios: \'Haya lámparas en el cielo que separen el día de la noche, que sirvan para señalar las fiestas, los días y los años,  15 y que brillen en el firmamento para iluminar la tierra.\' Y así sucedió.  16 Hizo, pues, Dios dos grandes lámparas: la más grande para presidir el día y la más chica para presidir la noche, e hizo también las estrellas.  17 Dios las colocó en lo alto de los cielos para iluminar la tierra,  18 para presidir el día y la noche y separar la luz de las tinieblas; y vio Dios que esto era bueno.  19 Y atardeció y amaneció: fue el día Cuarto.  20 Dijo Dios: \'Llénense las aguas de seres vivientes y revoloteen aves sobre la tierra y bajo el firmamento.  21 Dios creó entonces los grandes monstruos marinos y todos los seres que viven en el agua según su especie, y todas las aves, según su especie. Y vio Dios que todo ello era bueno.  22 Los bendijo Dios, diciendo: \'Crezcan, multiplíquense y llenen las aguas del mar, y multiplíquense asimismo las aves sobre la tierra.  23 Y atardeció y amaneció: fue el día Quinto.  24 Dijo Dios: \'Produzca la tierra animales vivientes de diferentes especies, animales del campo, reptiles y animales salvajes\'. Y así fue.  25 Dios hizo las distintas clases de animales salvajes según su especie, los animales del campo según su especie, y todos los reptiles de la tierra según su especie. Y vio Dios que todo esto era bueno.  26 Dijo Dios: \'Hagamos al hombre a nuestra imagen y semejanza. Que tenga autoridad sobre los peces del mar y sobre las aves del cielo, sobre los animales del campo, las fieras salvajes y los reptiles que se arrastran por el suelo.\'  27 Y creó Dios al hombre a su imagen. A imagen de Dios lo creó. Macho y hembra los creó.  28 Dios los bendijo, diciéndoles: \'Sean fecundos y multiplíquense. Llenen la tierra y sométanla. Tengan autoridad sobre los peces del mar, sobre las aves del cielo y sobre todo ser viviente que se mueve sobre la tierra.  29 Dijo Dios: \'Hoy les entrego para que se alimenten toda clase de plantas con semillas que hay sobre la tierra, y toda clase de árboles frutales.  30 A los animales salvajes, a las aves del cielo y a todos los seres vivientes que se mueven sobre la tierra, les doy pasto verde para que coman. Y así fue.  31 Dios vio que todo cuanto había hecho era muy bueno. Y atardeció y amaneció: fue el día Sexto.', '2024-04-04 15:34:55'),
(6, 1, 1, '\'dasdasdsa\'', '2024-04-04 15:36:03'),
(7, 1, 1, '\'asadadasdasdasdasd\'', '2024-04-04 15:36:18'),
(8, 1, 1, '\"gdkfgkdfkgdfkjgdfkhgdfk\"', '2024-04-04 15:36:49'),
(9, 1, 1, '´etertertertetertert eterterteteteter´ ektetektjehktejktehtkehrthketkjerktekjtekrjtrt', '2024-04-04 15:37:20'),
(10, 1, 1, 'ola k ase', '2024-04-04 15:51:17'),
(11, 1, 8, 'nkjasdkjaskswa', '2024-04-06 14:33:15');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `username` varchar(25) DEFAULT NULL,
  `password` varchar(25) DEFAULT NULL,
  `rol` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `username`, `password`, `rol`) VALUES
(1, 'luis', 'prueba', 1),
(2, 'mauro', 'mauro', 0),
(3, 'juan', 'juan', 0);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `grupos`
--
ALTER TABLE `grupos`
  ADD PRIMARY KEY (`id_grupo`),
  ADD KEY `id_admin` (`id_usuario`);

--
-- Indices de la tabla `mensajes`
--
ALTER TABLE `mensajes`
  ADD PRIMARY KEY (`id_mensaje`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `grupos`
--
ALTER TABLE `grupos`
  MODIFY `id_grupo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `mensajes`
--
ALTER TABLE `mensajes`
  MODIFY `id_mensaje` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `grupos`
--
ALTER TABLE `grupos`
  ADD CONSTRAINT `grupos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
