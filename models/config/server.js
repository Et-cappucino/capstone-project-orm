const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize("movieapp", "root", "", {
  host: "127.0.0.1",
  dialect: "mysql"
});

const APIKEY = "04c35731a5ee918f014970082a0088b1";

const Actor = sequelize.define(
  "actor",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    birth_date: {
      type: DataTypes.DATEONLY
    },
    image_path: {
      type: DataTypes.STRING
    },
    bio: {
      type: DataTypes.STRING
    }
  },
  {
    freezeTableName: true,
    timestamps: false
  }
);

const Watchable = sequelize.define(
  "watchable",
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    release_date: {
      type: DataTypes.DATEONLY
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    trailer_link: {
      type: DataTypes.STRING
    },
    rating: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    vote_count: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    poster_path: {
      type: DataTypes.STRING
    },
    main_backdrop_path: {
      type: DataTypes.STRING
    }
  },
  {
    freezeTableName: true,
    timestamps: false
  }
);

const Genre = sequelize.define(
  "genres",
  {
    watchable_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    genre: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    }
  },
  {
    freezeTableName: true,
    timestamps: false
  }
);

const Cast = sequelize.define(
  "cast",
  {
    watchable_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    actor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    }
  },
  {
    freezeTableName: true,
    timestamps: false
  }
);

const Backdrop = sequelize.define(
  "backdrops",
  {
    watchable_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    backdrop_path: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    }
  },
  {
    freezeTableName: true,
    timestamps: false
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch(error => {
    console.error("Unable to connect to the database: ", error);
  });

module.exports = { sequelize, APIKEY, Actor, Watchable, Genre, Cast, Backdrop };
